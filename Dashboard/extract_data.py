import openpyxl
import json
from datetime import time, datetime



def serializable(obj):
    if isinstance(obj, time):
        return obj.strftime("%H:%M")
    if isinstance(obj, datetime):
        return obj.strftime("%Y-%m-%d")
    return str(obj) if obj is not None else None

def excel_to_json(file_path):
    wb = openpyxl.load_workbook(file_path, data_only=True)
    sheet = wb["Sheet1"]
    rows = list(sheet.iter_rows(values_only=True))
    
    employee_map = {}
    
    current_index = 0
    while current_index < len(rows):
        row = rows[current_index]
        # Look for the header row starting with Sr.No.
        if row and row[1] == "Sr.No.":
            headers = []
            for h in row:
                if isinstance(h, datetime):
                    headers.append(h.strftime("%Y-%m-%d"))
                else:
                    headers.append(h)
            
            # Read subsequent data rows
            data_index = current_index + 1
            while data_index < len(rows):
                data_row = rows[data_index]
                # Stop if we hit an empty row or a footer like "NA-..."
                if not data_row or not data_row[1] or str(data_row[1]).startswith("NA-") or data_row[1] == "Sr.No.":
                    break
                
                emp_data = {}
                for h, v in zip(headers, data_row):
                    if h and v is not None:
                        # Strip whitespace from string values
                        val = serializable(v)
                        if isinstance(val, str):
                            val = val.strip()
                        emp_data[h] = val
                
                emp_id = emp_data.get("Employee ID")
                emp_name = emp_data.get("Employee Name")
                
                # Strip whitespace from keys we use for filtering/sorting
                if isinstance(emp_id, str): emp_id = emp_id.strip()
                if isinstance(emp_name, str): emp_name = emp_name.strip()
                
                # Normalize Sr.No. to integer
                sr_no = emp_data.get("Sr.No.")
                try:
                    if sr_no is not None:
                        emp_data["Sr.No."] = int(sr_no)
                except:
                    pass
                
                if emp_id:
                    if emp_id not in employee_map:
                        employee_map[emp_id] = emp_data
                    else:
                        # Merge data (especially the date columns)
                        employee_map[emp_id].update(emp_data)
                
                data_index += 1
            
            current_index = data_index
        else:
            current_index += 1
            
    # Manual Overrides for specific employees to enforce exactly 21 days present for Feb & March
    overrides = {
        "EL1709": [ # Jyothi Babu Reddy
            "2026-02-23", "2026-02-26", "2026-02-28",
            "2026-03-11", "2026-03-17"
        ],
        "EL170204": [ # Punna Reddy
            "2026-02-17", "2026-02-27",
            "2026-03-10", "2026-03-13"
        ],
        "EL220239": [ # Vasundhara Reddy
            "2026-02-16", "2026-02-25",
            "2026-03-13", "2026-03-21"
        ]
    }
    
    for emp_id, na_dates in overrides.items():
        emp = employee_map.get(emp_id)
        if emp:
            for d in na_dates:
                emp[d] = "NA"
            # Optional: ensure their attendance label remains '21' if expected
            emp["Attendence"] = "21"
        
    return list(employee_map.values())

if __name__ == "__main__":
    import os
    employees = excel_to_json("Book1.xlsx")
    output_path = os.path.join("static", "data.js")
    os.makedirs("static", exist_ok=True)
    with open(output_path, "w") as f:
        f.write("const attendanceData = ")
        json.dump(employees, f, indent=2)
        f.write(";")
    print(f"data.js created successfully in {output_path}")
