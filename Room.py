import asyncio
import json
from utils import calculate_median, angle_difference
from fastapi.websockets import WebSocketDisconnect
import math 
next_calibration = {
    "center": "left",
    "left": "right",
    "right": None
}
class Room:
    def __init__(self, room_id : int):
        self.room_id = room_id
        self.computer_client: ComputerClient = None
        self.mobile_clients: list[MobileClient] = []
        self.calibrations: dict[str, dict[str, list[float]]] = {
            "x": {},
            "y": {}
        }
        self.calibrations_final: dict[str, dict[str, float]] = {
            "x": {},
            "y": {}
        }
        self.current_calibration_position = "center"

    def set_computer_client(self, websocket):
        if (self.computer_client is not None):
            print("Replacing existing computer client.")
            self.remove_computer_client()
        new_computer = ComputerClient(websocket)
        self.computer_client = new_computer
        return new_computer

    def add_mobile_client(self, websocket):
        new_mobile = MobileClient(websocket, self)
        self.mobile_clients.append(new_mobile)
        return new_mobile
    
    def remove_client(self, client):
        if isinstance(client, MobileClient):
            self.remove_mobile_client(client)
        elif isinstance(client, ComputerClient):
            self.remove_computer_client()
        else:
            print(f"Unknown client type: {type(client)}")
        
    def remove_mobile_client(self, client):
        if client in self.mobile_clients:
            self.mobile_clients.remove(client)
    
    def remove_computer_client(self):
        self.computer_client = None
    
    def get_clients(self):
        return {
            "computer": self.computer_client,
            "mobile": self.mobile_clients
        }
        
    def clear_calibrations(self):
        self.calibrations['x'].clear()
        self.calibrations['y'].clear()
        self.calibrations_final['x'].clear()
        self.calibrations_final['y'].clear()
    
    async def on_calibration_complete(self):
        print("Calibration complete. Final calibrations:", self.calibrations)
        self.calibrations_final = {
            "x": {k: calculate_median(v) for k, v in self.calibrations['x'].items()},
            "y": {k: calculate_median(v) for k, v in self.calibrations['y'].items()}
        }
        self.calibrations_final['x']["range"] = angle_difference(self.calibrations_final['x']["left"], self.calibrations_final['x']["right"])
        self.calibrations_final['y']["range"] = angle_difference(self.calibrations_final['y']["left"], self.calibrations_final['y']["right"])
        print("Final calibrations:", self.calibrations_final)
        if self.computer_client:
            await self.computer_client.on_calibration_complete()
        for mobile in self.mobile_clients:
            await mobile.on_calibration_complete()

    async def next_calibration_position(self, position):
        self.current_calibration_position = next_calibration.get(position, None)
        print(f"Next calibration position: {self.current_calibration_position}")
        if self.current_calibration_position is None:
            print("Calibration complete.")
            await self.on_calibration_complete()
            return None
        await self.computer_client.request_calibration(self.current_calibration_position)
        for mobile in self.mobile_clients:
            await mobile.request_calibration(self.current_calibration_position)
        return self.current_calibration_position
    
    async def add_calibration_data(self, position, x, y):
        if position not in self.calibrations['x']:
            self.calibrations['x'][position] = []
        if position not in self.calibrations['y']:
            self.calibrations['y'][position] = []
        self.calibrations['x'][position].append(x)
        self.calibrations['y'][position].append(y)
        print(f"Calibration for {position}: {self.calibrations['x'][position]}")
        if len(self.calibrations['x'][position]) >= 5 and len(self.calibrations['y'][position]) >= 5:
            await self.next_calibration_position(position)


    async def fire(self, player_id):
        if not self.computer_client:
            print("No computer client connected to fire event.")
            return
        await self.computer_client.fire(player_id)

    async def update_cursor_position(self,player_id, x, y):
        if not self.computer_client:
            print("No computer client connected to update cursor position.")
            return
        diff_x = angle_difference(x, self.calibrations_final['x']["center"])
        diff_y = angle_difference(y, self.calibrations_final['y']["center"])
        print(f"Diff X: {diff_x}, Diff Y: {diff_y}, X: {x} Y: {y}")
        shift_x = -math.copysign(math.fabs(math.tan(diff_x * math.pi / 180) / math.tan(self.calibrations_final['x']["range"] * math.pi / 180)) , diff_x)* 50 + 50
        shift_y = math.copysign(math.fabs(math.tan(diff_y * math.pi / 180) / math.tan(self.calibrations_final['y']["range"] * math.pi / 180)) , diff_y)* 50 + 50
        new_position_x = max(min(shift_x, 100), 0)
        new_position_y = max(min(shift_y, 100), 0)
        await self.computer_client.send_message(json.dumps({"type": "update", "player_id": player_id, "x": new_position_x, "y": new_position_y}))

    async def start(self, websocket, client_type):
        
        if client_type == "mobile":
            client = self.add_mobile_client(websocket)
        elif client_type == "computer":
            client = self.set_computer_client(websocket)
        else:
            print(f"Unknown client type: {client_type}")
            return
        try:
            while True:
                print(f"Waiting for messages from {client_type} client.")
                await client.update()
        except WebSocketDisconnect:
            self.remove_client(client)
        except Exception as e:
            print(f"Error in client connection: {e}")
            self.remove_client(client)

            
        
class Client:
    def __init__(self, websocket, id, client_type, room: Room):
        self.websocket = websocket
        self.id = id
        self.client_type = client_type
        self.room = room

    async def send_message(self, message):
        if self.websocket:
            await self.websocket.send_text(message)
    
    async def receive_message(self):
        return await self.websocket.receive_text()

    async def update(self):
        data = await self.receive_message()
        print(f"Received data: {data}")

    async def request_calibration(self, new_calibration):
        await self.websocket.send_text(json.dumps({"type": "request_calibration", "position": new_calibration}))
    
class MobileClient(Client):
    def __init__(self, websocket, room, id=None):
        if id is None:
            id = f"mobile_{len(room.mobile_clients) + 1}"
        super().__init__(websocket,id, "mobile", room)
    

    async def handle_calibration_event(self, data):
        position = data['position']
        x = float(data['x'])
        y = float(data['y'])
        await self.room.add_calibration_data(position, x, y)
        print(f"Calibration for {position}: {self.room.calibrations['x'][position]}")

    async def handle_fire_event(self):
        await self.room.fire(self.id)
    
    async def handle_update_event(self, data):
        await self.room.update_cursor_position(self.id, float(data['x']), float(data['y']))
    
    async def on_calibration_complete(self):        
        await self.websocket.send_text(json.dumps({"type": "calibration_complete"}))

    async def update(self):
        data = await self.receive_message()
        print(f"Received data: {data}")
        data = json.loads(data)
        if data['type'] == "calibration":
            await self.handle_calibration_event(data)
        elif data['type'] == "fire":
            await self.handle_fire_event()
        elif data['type'] == "update":
            await self.handle_update_event(data)

class ComputerClient(Client):
    def __init__(self, websocket, id="computer"):
        super().__init__(websocket, id, "computer", None)
    
    async def handle_fire_event(self, player_id):
        await self.send_message(json.dumps({"type": "fire", "player_id": player_id}))
    
    async def handle_update_event(self, data):
        await self.send_message(json.dumps({"type": "update", "player_id": data['player_id'], "x": data['x'], "y": data['y']}))

    async def on_calibration_complete(self):
        await self.send_message(json.dumps({"type": "calibration_complete"}))
        
    async def fire(self, player_id):
        await self.send_message(json.dumps({"type": "fire", "player_id": player_id}))