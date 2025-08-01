import asyncio
import json
from utils import calculate_median, angle_difference
from fastapi.websockets import WebSocketDisconnect
import math 
from uuid import uuid4
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
        self.hits = {
            
        }
        self.calibrations: dict[str, dict[str, list[float]]] = {

        }
        self.calibrations_final: dict[str, dict[str, float]] = {

        }
        self.current_calibration_position = {

        }

    async def set_computer_client(self, websocket):
        uuid = str(uuid4())
        if (self.computer_client is not None):
            print("Replacing existing computer client.")
            self.remove_computer_client()
        new_computer = ComputerClient(websocket, uuid, self)
        self.computer_client = new_computer
        for mobile in self.mobile_clients:
            await new_computer.new_player_connected(mobile.id)
        return new_computer

    async def add_mobile_client(self, websocket):
        uuid = str(uuid4())
        new_mobile = MobileClient(websocket, uuid, self)
        self.current_calibration_position[uuid] = "center"
        self.calibrations[uuid] = {
            "x": {},
            "y": {}
        }
        self.calibrations_final[uuid] = {
            "x": {},
            "y": {}
        }
        self.mobile_clients.append(new_mobile)
        if self.computer_client:
            print(f"New mobile client connected: {uuid}")
            await self.computer_client.new_player_connected(uuid)
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
        
    def clear_calibrations(self, player_id=None):
        if player_id:
            if player_id in self.calibrations:
                del self.calibrations[player_id]
            if player_id in self.calibrations_final:
                del self.calibrations_final[player_id]
            if player_id in self.current_calibration_position:
                del self.current_calibration_position[player_id]
        else:
            self.calibrations.clear()
            self.calibrations_final.clear()
            self.current_calibration_position.clear()
    
    async def on_calibration_complete(self, player_id):
        print("Calibration complete. Final calibrations:", self.calibrations)
        self.calibrations_final[player_id] = {
            "x": {k: calculate_median(v) for k, v in self.calibrations[player_id]['x'].items()},
            "y": {k: calculate_median(v) for k, v in self.calibrations[player_id]['y'].items()}
        }
        self.calibrations_final[player_id]['x']["range"] = angle_difference(self.calibrations_final[player_id]['x']["left"], self.calibrations_final[player_id]['x']["right"])/1.75
        self.calibrations_final[player_id]['y']["range"] = angle_difference(self.calibrations_final[player_id]['y']["left"], self.calibrations_final[player_id]['y']["right"])/1.75
        print("Final calibrations:", self.calibrations_final)
        if self.computer_client:
            await self.computer_client.on_calibration_complete(player_id)
        for mobile in self.mobile_clients:
            if mobile.id == player_id:
                await mobile.on_calibration_complete()

    async def next_calibration_position(self, position, player_id):
        print(f"Next calibration position for {player_id}: {position}")
        self.current_calibration_position[player_id] = next_calibration.get(position, None)
        print(f"Next calibration position: {self.current_calibration_position}")
        if self.current_calibration_position[player_id] is None:
            print("Calibration complete.")
            await self.on_calibration_complete(player_id)
            return None
        await self.computer_client.request_calibration(self.current_calibration_position[player_id], player_id)
        for mobile in self.mobile_clients:
            if mobile.id == player_id:
                await mobile.request_calibration(self.current_calibration_position[player_id])
        return self.current_calibration_position[player_id]

    async def add_calibration_data(self, position, x, y, player_id):
        if position not in self.calibrations[player_id]['x']:
            self.calibrations[player_id]['x'][position] = []
        if position not in self.calibrations[player_id]['y']:
            self.calibrations[player_id]['y'][position] = []
        self.calibrations[player_id]['x'][position].append(x)
        self.calibrations[player_id]['y'][position].append(y)
        print(f"Calibration for {position}: {self.calibrations[player_id]['x'][position]}")
        print(self.calibrations)
        if len(self.calibrations[player_id]['x'][position]) >= 5 and len(self.calibrations[player_id]['y'][position]) >= 5:
            await self.next_calibration_position(position, player_id)


    async def fire(self, player_id):
        if not self.computer_client:
            print("No computer client connected to fire event.")
            return
        await self.computer_client.fire(player_id)

    async def update_cursor_position(self,player_id, x, y):
        if not self.computer_client:
            print("No computer client connected to update cursor position.")
            return
        diff_x = angle_difference(x, self.calibrations_final[player_id]['x']["center"])
        diff_y = angle_difference(y, self.calibrations_final[player_id]['y']["center"])
        shift_x = -math.copysign(math.fabs(math.tan(diff_x * math.pi / 180) / math.tan(self.calibrations_final[player_id]['x']["range"] * math.pi / 180)) , diff_x)* 50 + 50
        shift_y = math.copysign(math.fabs(math.tan(diff_y * math.pi / 180) / math.tan(self.calibrations_final[player_id]['y']["range"] * math.pi / 180)) , diff_y)* 50 + 50
        new_position_x = max(min(shift_x, 100), 0)
        new_position_y = max(min(shift_y, 100), 0)
        await self.computer_client.send_message(json.dumps({"type": "update", "player_id": player_id, "x": new_position_x, "y": new_position_y}))

    async def start(self, websocket, client_type):
        
        if client_type == "mobile":
            client = await self.add_mobile_client(websocket)
        elif client_type == "computer":
            client = await self.set_computer_client(websocket)
        else:
            print(f"Unknown client type: {client_type}")
            return
        try:
            while True:
                await client.update()
        except WebSocketDisconnect:
            print("Client disconnected.")
            print(f"Removing client: {client.id}")
            print(f"Mobile counts: {len(self.mobile_clients)}")
            
            self.remove_client(client)
        except Exception as e:
            print(f"Error in client connection: {e}")
            self.remove_client(client)
    async def hit(self, player_id):
        if not self.computer_client:
            print("No computer client connected to handle hit event.")
            return
        
        for mobile in self.mobile_clients:
            if mobile.id == player_id:
                await mobile.handle_hit_event()

            
        
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

    async def request_calibration(self, new_calibration):
        await self.websocket.send_text(json.dumps({"type": "request_calibration", "position": new_calibration}))
    
class MobileClient(Client):
    def __init__(self, websocket, id, room):
        if id is None:
            id = f"mobile_{len(room.mobile_clients) + 1}"
        super().__init__(websocket,id, "mobile", room)
    

    async def handle_calibration_event(self, data):
        position = data['position']
        x = float(data['x'])
        y = float(data['y'])
        await self.room.add_calibration_data(position, x, y, self.id)
        print(f"Calibration for {position}: {self.room.calibrations[self.id]['x'][position]}")

    async def handle_fire_event(self):
        await self.room.fire(self.id)
    
    async def handle_update_event(self, data):
        await self.room.update_cursor_position(self.id, float(data['x']), float(data['y']))
    
    async def on_calibration_complete(self):        
        await self.websocket.send_text(json.dumps({"type": "calibration_complete"}))

    async def update(self):
        data = await self.receive_message()
        data = json.loads(data)
        if data['type'] == "calibration":
            await self.handle_calibration_event(data)
        elif data['type'] == "fire":
            await self.handle_fire_event()
        elif data['type'] == "update":
            await self.handle_update_event(data)
    
    async def handle_hit_event(self):
        await self.send_message(json.dumps({"type": "hit"}))

class ComputerClient(Client):
    def __init__(self, websocket, id,room):
        super().__init__(websocket, id, "computer", room)
    
    async def handle_fire_event(self, player_id):
        await self.send_message(json.dumps({"type": "fire", "player_id": player_id}))
    
    async def handle_update_event(self, data, player_id):
        await self.send_message(json.dumps({"type": "update", "player_id": player_id, "x": data['x'], "y": data['y']}))

    async def on_calibration_complete(self, player_id):
        await self.send_message(json.dumps({"type": "calibration_complete", "player_id": player_id}))

    async def fire(self, player_id):
        await self.send_message(json.dumps({"type": "fire", "player_id": player_id}))
        
    async def new_player_connected(self, player_id):
        await self.send_message(json.dumps({"type": "new_player", "player_id": player_id}))
        
    async def request_calibration(self, new_calibration, player_id):
        await self.send_message(json.dumps({"type": "request_calibration", "position": new_calibration, "player_id": player_id}))
    
    async def handle_fire_event(self, player_id):
        await self.room.hit(player_id)
    
    async def update(self):
        data = await self.receive_message()
        data = json.loads(data)
        if data['type'] == "hit":
            await self.handle_fire_event(data['player_id'])
