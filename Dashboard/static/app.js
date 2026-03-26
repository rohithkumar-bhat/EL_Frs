document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

async function initDashboard() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Failed to fetch attendance data');
        const employees = await response.json();
        
        // 1. Update Stat Cards & Metrics
        const totalEmployees = employees.length;
        document.querySelector('#total-employees .card-value').textContent = totalEmployees;
        document.getElementById('emp-count-badge').textContent = totalEmployees;
        
        // Calculate Total Working Days
        const dateKeys = Object.keys(employees[0]).filter(key => key.startsWith('2026-'));
        // A "Working Day" is a date key where status is NOT 'SUNDAY', 'NA', or '--' for at least some employees
        // But more accurately, we can just count the keys that are not explicitly marked as SUNDAY
        const workingDays = dateKeys.filter(date => {
            const sampleStatus = employees[0][date];
            return sampleStatus !== 'SUNDAY' && sampleStatus !== 'NA' && sampleStatus !== '--';
        }).length;
        document.querySelector('#total-days .card-value').textContent = workingDays;
        
        // Calculate Average Attendance
        const avgPerc = employees.reduce((sum, emp) => sum + parseFloat(emp.Percentage || 0), 0) / totalEmployees;
        document.querySelector('#avg-attendance .card-value').textContent = avgPerc.toFixed(1) + '%';
        
        // Find Top Performer
        const topEmp = employees.reduce((prev, current) => (parseFloat(prev.Percentage) > parseFloat(current.Percentage)) ? prev : current);
        const topEmpId = topEmp['Employee ID'];
        const topName = topEmp['Employee Name'] || 'Employee';
        document.querySelector('#top-perf .card-value').textContent = topName.split(' ')[0];

        // 2. Setup Navigation
        setupNavigation(employees);

        // 3. Render Views
        renderTable(employees);
        renderEmployeeDetails(employees);
        renderReports(employees);
        renderLeaveRoster(employees);

        // 3. Setup Filters
        const searchInput = document.getElementById('employee-search');
        const departmentFilter = document.getElementById('department-filter');
        const attendanceFilter = document.getElementById('attendance-filter');

        // Populate Department Filter
        const departments = [...new Set(employees.map(emp => emp.Branch))].filter(Boolean).sort();
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            departmentFilter.appendChild(option);
        });

        const applyFilters = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const selectedDept = departmentFilter.value;
            const selectedAttendance = attendanceFilter.value;

            const filtered = employees.filter(emp => {
                const matchesSearch = emp['Employee Name'].toLowerCase().includes(searchTerm) || 
                                     emp['Employee ID'].toLowerCase().includes(searchTerm);
                
                const matchesDept = selectedDept === 'all' || emp.Branch === selectedDept;
                
                const perc = parseFloat(emp.Percentage || 0);
                let matchesAttendance = true;
                if (selectedAttendance === 'excellent') matchesAttendance = perc >= 90;
                else if (selectedAttendance === 'good') matchesAttendance = perc >= 75 && perc < 90;
                else if (selectedAttendance === 'low') matchesAttendance = perc < 75;

                return matchesSearch && matchesDept && matchesAttendance;
            });

            renderTable(filtered);
            renderEmployeeDetails(filtered);
            renderReports(filtered);
            renderLeaveRoster(filtered);
            
            // Update counts if needed
            document.getElementById('emp-count-badge').textContent = filtered.length;
        };

        searchInput.addEventListener('input', applyFilters);
        departmentFilter.addEventListener('change', applyFilters);
        attendanceFilter.addEventListener('change', applyFilters);
        
        // 4. Dashboard Shortcuts
        document.getElementById('total-employees').style.cursor = 'pointer';
        document.getElementById('total-employees').addEventListener('click', () => {
            document.getElementById('nav-employees').click();
        });
        
        document.getElementById('top-perf').style.cursor = 'pointer';
        document.getElementById('top-perf').addEventListener('click', () => {
            document.getElementById('nav-employees').click();
            
            // Highlight top performer after a tiny delay to ensure view is visible
            setTimeout(() => {
                const topCard = document.getElementById(`emp-card-${topEmpId}`);
                if (topCard) {
                    // Remove other highlights
                    document.querySelectorAll('.employee-detail-card').forEach(c => c.classList.remove('highlight-top'));
                    topCard.classList.add('highlight-top');
                    topCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        });

        document.getElementById('avg-attendance').style.cursor = 'pointer';
        document.getElementById('avg-attendance').addEventListener('click', () => {
            document.getElementById('nav-dashboard').click(); // Stays on dashboard but can be used for scroll if needed
        });

        // 4. Setup Charts
        setupCharts(employees);

        // Remove Loader
        setTimeout(() => {
            document.getElementById('loading-overlay').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loading-overlay').style.display = 'none';
            }, 500);
        }, 800);
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        document.getElementById('loading-overlay').innerHTML = `
            <div class="error-msg" style="text-align: center; color: white; padding: 2rem;">
                <h2 style="margin-bottom: 1rem;">Error Loading Data</h2>
                <p style="margin-bottom: 2rem; opacity: 0.8;">${error.message}</p>
                <button onclick="location.reload()" class="btn btn-primary">Retry</button>
            </div>
        `;
    }
}

function renderTable(data) {
    const listBody = document.getElementById('employee-list');
    listBody.innerHTML = '';

    data.forEach(emp => {
        const tr = document.createElement('tr');
        const perc = parseFloat(emp.Percentage || 0);
        const name = emp['Employee Name'];
        
        // Calculate stats for this employee
        const dateKeys = Object.keys(emp).filter(key => key.startsWith('2026-'));
        let daysPresent = 0;
        let daysLeave = 0;
        
        dateKeys.forEach(date => {
            const status = emp[date];
            if (!status || status === 'SUNDAY' || status === 'NA' || status === '--') return;
            if (status === 'leave') daysLeave++;
            else daysPresent++;
        });
        
        tr.innerHTML = `
            <td>
                <div class="emp-info">
                    <span>${name}</span>
                </div>
            </td>
            <td>${emp['Employee ID']}</td>
            <td>${emp['Branch']}</td>
            <td>${emp['Attendence']}</td>
            <td>
                <div class="perc-bar-container">
                    <div class="perc-bar" style="width: ${perc}%"></div>
                </div>
                ${perc.toFixed(1)}%
            </td>
            <td style="text-align: center;">
                <button class="view-btn-new" data-emp-id="${emp['Employee ID']}" title="View Details">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
            </td>
        `;
        listBody.appendChild(tr);
    });

    // Add delegation listener once
    if (!listBody.dataset.hasListener) {
        listBody.addEventListener('click', (e) => {
            const btn = e.target.closest('.view-btn-new');
            if (btn) {
                const empId = btn.dataset.empId;
                document.getElementById('nav-employees').click();
                setTimeout(() => {
                    const card = document.getElementById(`emp-card-${empId}`);
                    if (card) {
                        document.querySelectorAll('.employee-detail-card').forEach(c => c.classList.remove('highlight-top'));
                        card.classList.add('highlight-top'); // Using the same highlighter class
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            }
        });
        listBody.dataset.hasListener = 'true';
    }
}

function setupCharts(data) {
    // 1. Daily Attendance Trend
    // We need to count how many employees were present each day
    const dateKeys = Object.keys(data[0]).filter(key => key.startsWith('2026-'));
    const dailyCounts = dateKeys.map(date => {
        return data.filter(emp => {
            const status = emp[date];
            if (!status) return false;
            if (status === 'leave' || status === 'NA' || status === '--' || status === 'SUNDAY') return false;
            return true;
        }).length;
    });

    const dailyLeaves = dateKeys.map(date => {
        return data.filter(emp => emp[date] === 'leave').length;
    });

    const trendCtx = document.getElementById('attendanceTrendChart').getContext('2d');
    new Chart(trendCtx, {
        type: 'bar',
        data: {
            labels: dateKeys.map(d => d.split('-')[2]), // Just the day number
            datasets: [
                {
                    label: 'Present Count',
                    data: dailyCounts,
                    backgroundColor: '#a78bfa',
                    borderRadius: 6,
                    maxBarThickness: 15
                },
                {
                    label: 'Leaves Count',
                    data: dailyLeaves,
                    backgroundColor: '#fca5a5', // Soft Pastel Red
                    borderRadius: 6,
                    maxBarThickness: 15
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { color: '#64748b' }
                },
                x: { 
                    grid: { display: false },
                    ticks: { color: '#64748b' }
                }
            }
        }
    });

    // 2. Monthly Status (Present vs Leave)
    let totalPresent = 0;
    let totalLeave = 0;

    data.forEach(emp => {
        dateKeys.forEach(date => {
            const status = emp[date];
            if (!status || status === 'SUNDAY' || status === 'NA' || status === '--') return;
            if (status === 'leave') totalLeave++;
            else totalPresent++;
        });
    });

    const distCtx = document.getElementById('statusDistChart').getContext('2d');
    new Chart(distCtx, {
        type: 'doughnut',
        data: {
            labels: ['Present', 'Leave'],
            datasets: [{
                data: [totalPresent, totalLeave],
                backgroundColor: ['#a78bfa', '#fca5a5'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#64748b', padding: 20, font: { family: 'Outfit', size: 12 } }
                }
            }
        }
    });
}

function setupNavigation(data) {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.dashboard-view');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.id.replace('nav-', 'view-');
            
            // Update nav active state
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Update view visibility
            views.forEach(v => {
                if (v.id === targetId) {
                    v.style.display = 'block';
                    v.classList.add('active');
                } else {
                    v.style.display = 'none';
                    v.classList.remove('active');
                }
            });
        });
    });
}

function renderEmployeeDetails(data) {
    const grid = document.getElementById('employee-details-grid');
    grid.innerHTML = '';

    data.forEach(emp => {
        const dateKeys = Object.keys(emp).filter(key => key.startsWith('2026-'));
        let p = 0, l = 0;
        dateKeys.forEach(d => {
            const s = emp[d];
            if (!s || s === 'SUNDAY' || s === 'NA' || s === '--') return;
            if (s === 'leave') l++; else p++;
        });

        const card = document.createElement('div');
        card.className = 'card employee-detail-card glass';
        card.id = `emp-card-${emp['Employee ID']}`;
        card.innerHTML = `
            <div class="emp-detail-header">
                <div class="emp-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                    <div class="emp-detail-name">${emp['Employee Name']}</div>
                    <div class="emp-detail-id">ID: ${emp['Employee ID']}</div>
                </div>
            </div>
            <div class="emp-stats-row">
                <div class="emp-stat-box clickable-stat" data-emp-id="${emp['Employee ID']}" data-type="present" style="cursor: pointer;">
                    <span class="emp-stat-val stat-present">${p}</span>
                    <span class="emp-stat-label">Present</span>
                </div>
                <div class="emp-stat-box clickable-stat" data-emp-id="${emp['Employee ID']}" data-type="leave" style="cursor: pointer;">
                    <span class="emp-stat-val stat-leave">${l}</span>
                    <span class="emp-stat-label">Leaves</span>
                </div>
            </div>
            <div style="margin-top: 0.5rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 0.25rem;">
                    <span>Attendance Rate</span>
                    <span>${parseFloat(emp.Percentage || 0).toFixed(1)}%</span>
                </div>
                <div class="perc-bar-container" style="width: 100%; height: 8px;">
                    <div class="perc-bar" style="width: ${emp.Percentage}%"></div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    // Add Stat Box Listener once
    if (!grid.dataset.hasListener) {
        grid.addEventListener('click', (e) => {
            const box = e.target.closest('.clickable-stat');
            if (box) {
                const empId = box.dataset.empId;
                const type = box.dataset.type;
                
                // 1. Switch to Reports
                document.getElementById('nav-reports').click();
                
                // 2. Highlight after render (delay for view switch animation)
                setTimeout(() => {
                    const row = document.getElementById(`report-row-${empId}`);
                    if (row) {
                        // Clear existing highlights
                        document.querySelectorAll('.report-highlight').forEach(cell => cell.classList.remove('report-highlight', 'highlight-green', 'highlight-red'));
                        document.querySelectorAll('.highlight-report-row').forEach(r => r.classList.remove('highlight-report-row'));
                        
                        // Highlight THE ENTIRE ROW
                        row.classList.add('highlight-report-row');
                        
                        // Highlight matching cells specifically
                        const cells = row.querySelectorAll('td');
                        cells.forEach(cell => {
                            const status = cell.dataset.status;
                            if (type === 'present' && status !== 'leave' && status !== 'na' && status !== '--' && status !== 'sunday' && status !== '') {
                                cell.classList.add('report-highlight', 'highlight-green');
                            } else if (type === 'leave' && status === 'leave') {
                                cell.classList.add('report-highlight', 'highlight-red');
                            }
                        });
                        
                        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 300);
            }
        });
        grid.dataset.hasListener = 'true';
    }
}

function renderReports(data) {
    const head = document.getElementById('reports-head');
    const body = document.getElementById('reports-body');
    
    // Get all keys from first employee
    const keys = Object.keys(data[0]);
    
    // Header
    let headHtml = '<tr>';
    keys.forEach(k => headHtml += `<th>${k}</th>`);
    headHtml += '</tr>';
    head.innerHTML = headHtml;

    // Body
    let bodyHtml = '';
    data.forEach(emp => {
        bodyHtml += `<tr id="report-row-${emp['Employee ID']}">`;
        keys.forEach(k => {
            const val = emp[k] || '';
            let cls = '';
            const lowerVal = val.toString().toLowerCase();
            if (lowerVal === 'leave') cls = 'class="cell-leave"';
            else if (lowerVal === 'na') cls = 'class="cell-na"';
            
            bodyHtml += `<td ${cls} data-status="${lowerVal}">${val}</td>`;
        });
        bodyHtml += '</tr>';
    });
    body.innerHTML = bodyHtml;
}

function renderLeaveRoster(data) {
    const roster = document.getElementById('leave-roster');
    if (!roster) return;
    
    // Get all calendar dates
    const dateKeys = Object.keys(data[0]).filter(key => key.startsWith('2026-'));
    
    // Map dates to employees on leave
    const leaveByDate = [];
    dateKeys.forEach(date => {
        const onLeave = data.filter(emp => {
            const status = emp[date];
            return status && status.toString().toLowerCase() === 'leave';
        }).map(emp => emp['Employee Name']);
        
        if (onLeave.length > 0) {
            leaveByDate.push({ date: date, names: onLeave });
        }
    });
    
    if (leaveByDate.length === 0) {
        roster.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No leaves found for this period.</div>';
        return;
    }
    
    // Render
    let html = '';
    leaveByDate.forEach(item => {
        const d = new Date(item.date);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        html += `
            <div class="roster-date-group">
                <div class="roster-date">${dateStr}</div>
                <div class="roster-names">
                    ${item.names.map(name => `<span class="roster-name-badge">${name}</span>`).join('')}
                </div>
            </div>
        `;
    });
    roster.innerHTML = html;
}
