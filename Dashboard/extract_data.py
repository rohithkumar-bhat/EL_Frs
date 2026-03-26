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
    
    # Header is in Row 2 (1-indexed: 3)
    rows = list(sheet.iter_rows(values_only=True))
    header_row = rows[2]
    data_rows = rows[3:]
    
    # Process headers
    headers = []
    for h in header_row:
        if isinstance(h, datetime):
            headers.append(h.strftime("%Y-%m-%d"))
        else:
            headers.append(h)
    
    employees = []
    for row in data_rows:
        if not row[1]: # Skip empty rows
            continue
        emp = {}
        for h, v in zip(headers, row):
            if h:
                emp[h] = serializable(v)
        employees.append(emp)
    
    return employees

if __name__ == "__main__":
    employees = excel_to_json("Book1.xlsx")
    with open("data.js", "w") as f:
        f.write("const attendanceData = ")
        json.dump(employees, f, indent=2)
        f.write(";")
    print("data.js created successfully.")
