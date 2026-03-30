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
                    if h:
                        emp_data[h] = serializable(v)
                
                emp_id = emp_data.get("Employee ID")
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
