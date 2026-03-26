from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import openpyxl
from datetime import time, datetime
import os

app = FastAPI(title="EL FRS Attendance API")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EXCEL_FILE = os.path.join(BASE_DIR, "Book1.xlsx")

def serializable(obj):
    if isinstance(obj, time):
        return obj.strftime("%H:%M")
    if isinstance(obj, datetime):
        return obj.strftime("%Y-%m-%d")
    return str(obj) if obj is not None else None

def extract_excel_data(file_path):
    if not os.path.exists(file_path):
        return None
    
    wb = openpyxl.load_workbook(file_path, data_only=True)
    sheet = wb["Sheet1"]
    
    rows = list(sheet.iter_rows(values_only=True))
    if len(rows) < 3:
        return []
        
    header_row = rows[2]
    data_rows = rows[3:]
    
    headers = []
    for h in header_row:
        if isinstance(h, datetime):
            headers.append(h.strftime("%Y-%m-%d"))
        else:
            headers.append(h)
    
    employees = []
    for row in data_rows:
        if not row[1] or not row[2]: # Skip rows without Sr.No or Employee Name
            continue
        emp = {}
        for h, v in zip(headers, row):
            if h:
                emp[h] = serializable(v)
        employees.append(emp)
    
    return employees

@app.get("/api/data")
async def get_attendance_data():
    data = extract_excel_data(EXCEL_FILE)
    if data is None:
        raise HTTPException(status_code=404, detail="Excel file not found")
    return data

@app.get("/")
async def read_index():
    return FileResponse(os.path.join(BASE_DIR, "static", "index.html"))

app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)


