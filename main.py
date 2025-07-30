from fastapi import FastAPI, Request, WebSocket
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import uvicorn
import json
import math
import asyncio
from fastapi.websockets import WebSocketDisconnect
from Room import Room
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


room = Room(1)
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global mobile_connections, computer_connections, calibrations, calibration_status, next_calibration,calibrations_final
    # get the string parameters from the websocket url parameters
    client_type = websocket.query_params.get("client")
    print(f"Client type: {client_type}")
    await websocket.accept()
    await room.start(websocket, client_type)


if __name__ == "__main__":
    uvicorn.run(app, host = "0.0.0.0",port=8000)

