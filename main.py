import random
from fastapi import FastAPI, Request, WebSocket
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import uvicorn
from Room import Room
app = FastAPI()

# Setup templates folder
templates = Jinja2Templates(directory="templates")
static = StaticFiles(directory="public", html=True)
app.mount("/public", static)
@app.get("/", response_class=HTMLResponse)
async def get(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/room/computer/{room_id}", response_class=HTMLResponse)
async def get(request: Request, room_id:int):    
    if room_id in rooms:        
        room = rooms[room_id]
        if room.game_type == "survival":
            return templates.TemplateResponse("survival.html", {"request": request, "room_id": room_id})
        return templates.TemplateResponse("index.html", {"request": request})
    else:
        return RedirectResponse(url='/create_room')

@app.get("/room/mobile/{room_id}", response_class=HTMLResponse)
async def get_mobile(request: Request, room_id:int):
    if room_id in rooms:        
        return templates.TemplateResponse("mobile.html", {"request": request})
    else:
        return RedirectResponse(url='/create_room')

@app.post("/create_room")
async def create_room(request:Request):
    id = random.randint(10000,99999)
    while id in rooms:
        id = random.randint(10000,99999)
    rooms[id] = Room(id)
    return RedirectResponse(url='/room/{}'.format(id))

@app.get("/room/{room_id}")
async def get_room_id(request:Request,room_id:int):
    user_agent = request.headers.get("User-Agent").lower()
    if "android" in user_agent or "iphone" in user_agent or "ipad" in user_agent or "mobile" in user_agent:
        return RedirectResponse(url='/room/mobile/{}'.format(room_id))
    else:
        return RedirectResponse(url='/room/computer/{}'.format(room_id))
        
        

room = Room(1)
rooms = {
    1:Room(1),
    2:Room(2, "survival"),
}
@app.websocket("/mobile/{room_id}/ws")
async def mobile_websocket_endpoint(websocket: WebSocket, room_id:int):
    # get the string parameters from the websocket url parameters
    print("Client type: mobile")
    print("Room ID: ", room_id)
    if room_id not in rooms:
        return 'Error: Room does not exist'

    await websocket.accept()
    await rooms[room_id].start(websocket, 'mobile')
    

@app.websocket("/computer/{room_id}/ws")    
async def computer_websocket_endpoint(websocket: WebSocket, room_id:int):
    # get the string parameters from the websocket url parameters
    print("Client type: computer")
    
    if room_id not in rooms:
        return 'Error: Room does not exist'
    await websocket.accept()
    await rooms[room_id].start(websocket, 'computer')



if __name__ == "__main__":
    uvicorn.run(app, host = "0.0.0.0",port=8000)

