<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EL FRS | Attendance Dashboard</title>
    <link rel="stylesheet" href="/static/styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="app-container">
        <!-- Sidebar -->
        <aside class="sidebar glass">
            <div class="logo">
                <img src="/static/logo.png" alt="Entro Labs" style="width: 100%; height: auto; max-width: 160px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">
            </div>
            <nav>
                <a href="#" class="nav-item active" id="nav-dashboard">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                    Dashboard
                </a>
                <a href="#" class="nav-item" id="nav-employees">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    Employees
                </a>
                <a href="#" class="nav-item" id="nav-reports">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Reports
                </a>
            </nav>
            <div class="user-profile">
                <img src="/static/professional_avatar.png" alt="User Avatar">
                <div class="user-info">
                    <span class="user-name">HR @ entrolabs</span>
                    <span class="user-role">HR Manager</span>
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="content">
            <!-- Dashboard View -->
            <section id="view-dashboard" class="dashboard-view active">
                <header class="top-nav glass">
                <div class="header-left">
                    <h1>Attendance <span class="badge">Feb 2026</span></h1>
                    <p class="subtitle">Welcome back! Here's the attendance summary.</p>
                </div>
                <div class="header-right">
                    <div class="search-bar glass">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" placeholder="Search employees..." id="employee-search">
                    </div>
                    <button class="btn btn-primary">Export CSV</button>
                </div>
            </header>

            <div class="dashboard-grid">
                <!-- Stats Cards -->
                <div class="card stat-card glass" id="total-days">
                    <div class="card-icon blue">📅</div>
                    <div class="card-value">28</div>
                    <div class="card-label">Total Days</div>
                </div>
                <div class="card stat-card glass" id="avg-attendance">
                    <div class="card-icon green">📊</div>
                    <div class="card-value">--%</div>
                    <div class="card-label">Avg. Attendance</div>
                </div>
                <div class="card stat-card glass" id="total-employees">
                    <div class="card-icon purple">👥</div>
                    <div class="card-value">--</div>
                    <div class="card-label">Total Employees</div>
                </div>
                <div class="card stat-card glass" id="top-perf">
                    <div class="card-icon gold">🏆</div>
                    <div class="card-value">--</div>
                    <div class="card-label">Top Performer</div>
                </div>

                <!-- Charts Section -->
                <div class="card chart-card glass grid-span-2">
                    <h3>Daily Attendance Trend</h3>
                    <canvas id="attendanceTrendChart"></canvas>
                </div>
                <div class="card chart-card glass">
                    <h3>Monthly Status</h3>
                    <canvas id="statusDistChart"></canvas>
                </div>
                
                <!-- NEW SECTION -->
                <div class="card glass leave-roster-card">
                    <h3>On Leave</h3>
                    <div class="leave-roster-content" id="leave-roster">
                        <!-- Dates and employee names will be injected here -->
                    </div>
                </div>

                <!-- Table Section -->
                <div class="card table-card glass grid-span-4">
                    <div class="table-header">
                        <h3>Detailed Attendance</h3>
                        <div class="filters">
                            <select id="department-filter" class="glass-select">
                                <option value="all">All Departments</option>
                            </select>
                            <select id="attendance-filter" class="glass-select">
                                <option value="all">All Scores</option>
                                <option value="excellent">Excellent (>90%)</option>
                                <option value="good">Good (75-90%)</option>
                                <option value="low">Low (<75%)</option>
                            </select>
                        </div>
                    </div>
                    <div class="table-wrapper">
                        <table id="employee-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>ID</th>
                                    <th>Department</th>
                                    <th>Attendance</th>
                                    <th>Percentage</th>
                                    <th style="text-align: center;">View Status</th>
                                </tr>
                            </thead>
                            <tbody id="employee-list">
                                <!-- Data will be injected here -->
                            </tbody>
                        </table>
                    </div>
                </div>
                </div>
            </section>

            <!-- Employees View -->
            <section id="view-employees" class="dashboard-view" style="display: none;">
                <header class="top-nav glass">
                    <div class="header-left">
                        <h1>Employees <span class="badge" id="emp-count-badge">--</span></h1>
                        <p class="subtitle">Complete employee directory and performance profiles.</p>
                    </div>
                </header>
                <div class="employee-grid" id="employee-details-grid">
                    <!-- Cards will be injected here -->
                </div>
            </section>

            <!-- Reports View -->
            <section id="view-reports" class="dashboard-view" style="display: none;">
                <header class="top-nav glass">
                    <div class="header-left">
                        <h1>Attendance Reports</h1>
                        <p class="subtitle">Exportable raw data and full attendance history.</p>
                    </div>
                    <button class="btn btn-primary" onclick="window.print()">Download PDF</button>
                </header>
                <div class="card table-card glass">
                    <div class="table-wrapper">
                        <table id="reports-table">
                            <thead id="reports-head"></thead>
                            <tbody id="reports-body"></tbody>
                        </table>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <!-- Modals, etc. -->
    <div id="loading-overlay">
        <div class="loader"></div>
    </div>

    <script src="/static/app.js"></script>
</body>
</html>
