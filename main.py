from fastapi import FastAPI, Request, WebSocket
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import uvicorn
import json
import math
import asyncio
from fastapi.websockets import WebSocketDisconnect

app = FastAPI()

# Setup templates folder
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def get(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/", response_class=HTMLResponse)
async def get(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/mobile", response_class=HTMLResponse)
async def get_mobile(request: Request):
    return templates.TemplateResponse("mobile.html", {"request": request})

mobile_connections = None
computer_connections = None
calibration_status = None

next_calibration = {
    "center":"left",
    "left":"right",
    "right":None
}

calibrations_final = {
    "x": {},
    "y": {},
}
calibrations = {
    "x": {},
    "y": {}
}

def calculate_median(values):
    if not values:
        return 0
    sorted_values = sorted(values)
    mid = len(sorted_values) // 2
    if len(sorted_values) % 2 == 0:
        return (sorted_values[mid - 1] + sorted_values[mid]) / 2
    else:
        return sorted_values[mid]

def angle_difference(angle1, angle2):
    diff = (angle1 - angle2 + 540) % 360 - 180
    return diff

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global mobile_connections, computer_connections, calibrations, calibration_status, next_calibration,calibrations_final
    # get the string parameters from the websocket url parameters
    client_type = websocket.query_params.get("client")
    print(f"Client type: {client_type}")
    await websocket.accept()
    if client_type == "mobile":
        mobile_connections = websocket
        
    else:
        computer_connections = websocket
    print(f"Client connected. Mobile: {mobile_connections}, computer: {computer_connections}")
    calibrations['x'].clear()
    calibrations['y'].clear()
    calibrations_final['x'].clear()
    calibrations_final['y'].clear()
    calibration_status = None    
    try:
        while True:
            if not mobile_connections or not computer_connections:
                print("No clients connected, waiting...")
                await asyncio.sleep(1)
                continue
            if calibration_status is None:
                calibration_status = "center"
                await mobile_connections.send_text(json.dumps({"type": "request_calibration", "position": "center"}))
                await computer_connections.send_text(json.dumps({"type": "request_calibration", "position": "center"}))
            data = await websocket.receive_text()
            data = json.loads(data)
            # Forward to all *other* clients
            if client_type == "mobile":
                if data['type'] == "calibration":
                    position = data['position']
                    x = float(data['x'])
                    y = float(data['y'])
                    if position not in calibrations['x']:
                        calibrations['x'][position] = []
                    if position not in calibrations['y']:
                        calibrations['y'][position] = []
                    calibrations['x'][position].append(x)
                    calibrations['y'][position].append(y)
                    print(f"Calibration for {position}: {calibrations['x'][position]}")
                    if len(calibrations['x'][position]) >= 5 and len(calibrations['y'][position]) >= 5:
                        # Process calibration data
                        print(f"Calibration complete for {position}")
                        next_position = next_calibration[position]
                        if next_position:
                            await computer_connections.send_text(json.dumps({"type": "request_calibration", "position": next_position}))
                            await mobile_connections.send_text(json.dumps({"type": "request_calibration", "position": next_position}))
                            print(f"Requesting calibration for {next_position}")
                        else: 
                            # All calibrations complete
                            calibrations_final = {
                                "x": {k: calculate_median(v) for k, v in calibrations['x'].items()},
                                "y": {k: calculate_median(v) for k, v in calibrations['y'].items()}
                            }
                            print(f"Final calibrations: {calibrations_final}")
                            calibrations_final['x']["range"] = angle_difference(calibrations_final['x']["right"], calibrations_final['x']["left"])
                            calibrations_final['y']["range"] = angle_difference(calibrations_final['y']["right"], calibrations_final['y']["left"])
                            await computer_connections.send_text(json.dumps({"type": "calibration_complete"}))
                            await mobile_connections.send_text(json.dumps({"type": "calibration_complete"}))
                            print("Calibration complete for all positions")
                if data['type'] == "update":
                    x = float(data['x'])
                    y = float(data['y'])
                    diff_x = angle_difference(x, calibrations_final['x']["center"])
                    diff_y = angle_difference(y, calibrations_final['y']["center"])
                    print(f"Diff X: {diff_x}, Diff Y: {diff_y}, X: {x} Y: {y}")
                    shift_x = -math.copysign(math.fabs(math.tan(diff_x * math.pi / 180) / math.tan(calibrations_final['x']["range"] * math.pi / 180)) , diff_x)* 50 + 50
                    shift_y = math.copysign(math.fabs(math.tan(diff_y * math.pi / 180) / math.tan(calibrations_final['y']["range"] * math.pi / 180)) , diff_y)* 50 + 50
                    new_position_x = max(min(shift_x, 100), 0)
                    new_position_y = max(min(shift_y, 100), 0)
                    await computer_connections.send_text(json.dumps({"type": "update", "x": new_position_x, "y": new_position_y}))
                if data['type'] == "shoot":
                    await computer_connections.send_text(json.dumps({"type": "shoot"}))
                    print("Mobile client shooting")
            else:
                print("Server client sending data")
    except WebSocketDisconnect:
        if client_type == "mobile":
            mobile_connections = None
        else:
            computer_connections = None
        print(f"Client disconnected. Mobile: {mobile_connections}, computer: {computer_connections}")
    except Exception as e:
        print(f"Unexpected error: {e}")
        if client_type == "mobile":
            mobile_connections = None
        else:
            computer_connections = None

if __name__ == "__main__":
    uvicorn.run(app, host = "0.0.0.0",port=8000)

