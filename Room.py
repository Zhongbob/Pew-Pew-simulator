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
        self.mobile_clients: dict[int, MobileClient] = {}
        self.bullets: dict[int, list[int]] = {
            
        }
        self.hits = {
            
        }
        self.calibrations: dict[int, dict[str, list[float]]] = {

        }
        self.calibrations_final: dict[int, dict[str, float]] = {

        }
        self.current_calibration_position = {

        }

    async def set_computer_client(self, websocket):
        uuid = str(uuid4())
        if (self.computer_client is not None):
            print("Another computer client is already connected.")
            websocket.close(code=4000, reason="Another computer client is already connected.")
            return None
        new_computer = ComputerClient(websocket, uuid, self)
        self.computer_client = new_computer
        for player_no in self.mobile_clients.keys():
            already_calibrated = player_no in self.calibrations_final
            await new_computer.new_player_connected(player_no, already_calibrated)
            if not already_calibrated:
                await new_computer.request_calibration(self.current_calibration_position[player_no], player_no)
        return new_computer

    async def add_mobile_client(self, websocket):
        player_no = None
        if len(self.mobile_clients) >= 4:
            print("Maximum number of mobile clients reached.")
            websocket.close(code=4000, reason="Maximum number of mobile clients reached.")
            return None
        for i in range(1,5):
            if i not in self.mobile_clients:
                player_no = i
                break
        
        new_mobile = MobileClient(websocket, player_no, self)
        self.current_calibration_position[player_no] = "center"
        self.calibrations[player_no] = {
            "x": {},
            "y": {}
        }

        self.mobile_clients[player_no] = new_mobile
        if self.computer_client:
            print(f"New mobile client connected: player_{player_no}")
            await self.computer_client.new_player_connected(player_no)
        return new_mobile
    
    def remove_client(self, client):
        if isinstance(client, MobileClient):
            self.remove_mobile_client(client)
        elif isinstance(client, ComputerClient):
            self.remove_computer_client()
        else:
            print(f"Unknown client type: {type(client)}")
        
    def remove_mobile_client(self, client):
        if client.player_no not in self.mobile_clients:
            print(f"Mobile client with player_no {client.player_no} not found.")
            return
        print(f"Removing mobile client: {client.player_no}")
        # Remove the client from the mobile_clients dictionary
        self.mobile_clients.pop(client.player_no, None)
        if self.computer_client:
            print(f"Handling player disconnect for player_no {client.player_no}")
            asyncio.create_task(self.computer_client.handle_player_disconnect(client.player_no))


    def remove_computer_client(self):
        self.computer_client = None
    
    def get_clients(self):
        return {
            "computer": self.computer_client,
            "mobile": self.mobile_clients
        }
        
    def clear_calibrations(self, player_no=None):
        if player_no:
            if player_no in self.calibrations:
                del self.calibrations[player_no]
            if player_no in self.calibrations_final:
                del self.calibrations_final[player_no]
            if player_no in self.current_calibration_position:
                del self.current_calibration_position[player_no]
        else:
            self.calibrations.clear()
            self.calibrations_final.clear()
            self.current_calibration_position.clear()
        print(self.calibrations_final)
    
    async def on_calibration_complete(self, player_no):
        print("Calibration complete. Final calibrations:", self.calibrations)
        self.calibrations_final[player_no] = {
            "x": {k: calculate_median(v) for k, v in self.calibrations[player_no]['x'].items()},
            "y": {k: calculate_median(v) for k, v in self.calibrations[player_no]['y'].items()}
        }
        self.calibrations_final[player_no]['x']["range"] = angle_difference(self.calibrations_final[player_no]['x']["left"], self.calibrations_final[player_no]['x']["right"])/1.75
        self.calibrations_final[player_no]['y']["range"] = angle_difference(self.calibrations_final[player_no]['y']["left"], self.calibrations_final[player_no]['y']["right"])/1.75
        print("Final calibrations:", self.calibrations_final)
        if self.computer_client:
            await self.computer_client.on_calibration_complete(player_no)
        await self.mobile_clients[player_no].on_calibration_complete()

    async def next_calibration_position(self, position, player_no):
        print(f"Next calibration position for {player_no}: {position}")
        self.current_calibration_position[player_no] = next_calibration.get(position, None)
        print(f"Next calibration position: {self.current_calibration_position}")
        if self.current_calibration_position[player_no] is None:
            print("Calibration complete.")
            await self.on_calibration_complete(player_no)
            return None
        await self.computer_client.request_calibration(self.current_calibration_position[player_no], player_no)

        await self.mobile_clients[player_no].request_calibration(self.current_calibration_position[player_no])
        return self.current_calibration_position[player_no]

    async def add_calibration_data(self, position, x, y, player_no):
        if (not self.computer_client):
            print("No computer client connected to handle calibration data.")
            return
        if position not in self.calibrations[player_no]['x']:
            self.calibrations[player_no]['x'][position] = []
        if position not in self.calibrations[player_no]['y']:
            self.calibrations[player_no]['y'][position] = []
        self.calibrations[player_no]['x'][position].append(x)
        self.calibrations[player_no]['y'][position].append(y)
        print(f"Calibration for {position}: {self.calibrations[player_no]['x'][position]}")
        print(self.calibrations)
        if len(self.calibrations[player_no]['x'][position]) >= 5 and len(self.calibrations[player_no]['y'][position]) >= 5:
            await self.next_calibration_position(position, player_no)
        else: 
            await self.computer_client.handle_fire_event(player_no)


    async def fire(self, player_no):
        if not self.computer_client:
            print("No computer client connected to fire event.")
            return
        if player_no not in self.bullets:
            # -1 indicates infinite total bullets
            self.bullets[player_no] = [30, -1]
        if self.bullets[player_no][0] <= 0:
            print(f"No bullets left for player {player_no}.")
            return
        self.bullets[player_no][0] -= 1
        await self.computer_client.fire(player_no, self.bullets[player_no])

    async def update_cursor_position(self,player_no, x, y):
        if not self.computer_client:
            print("No computer client connected to update cursor position.")
            return
        diff_x = angle_difference(x, self.calibrations_final[player_no]['x']["center"])
        diff_y = angle_difference(y, self.calibrations_final[player_no]['y']["center"])
        shift_x = -math.copysign(math.fabs(math.tan(diff_x * math.pi / 180) / math.tan(self.calibrations_final[player_no]['x']["range"] * math.pi / 180)) , diff_x)* 50 + 50
        shift_y = math.copysign(math.fabs(math.tan(diff_y * math.pi / 180) / math.tan(self.calibrations_final[player_no]['y']["range"] * math.pi / 180)) , diff_y)* 50 + 50
        new_position_x = max(min(shift_x, 100), 0)
        new_position_y = max(min(shift_y, 100), 0)
        await self.computer_client.send_message(json.dumps({"type": "update", "player_no": player_no, "x": new_position_x, "y": new_position_y}))

    async def reload(self, player_no):
        if player_no not in self.bullets:
            self.bullets[player_no] = [30, -1]  # Reset to 30 bullets if not already set
        self.bullets[player_no][0] = 30
        await self.computer_client.handle_reload_event(player_no, self.bullets[player_no])
        
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
            print(e)
            print(f"Error in client connection: {e}")
            self.remove_client(client)
    async def hit(self, player_no):
        if not self.computer_client:
            print("No computer client connected to handle hit event.")
            return

        await self.mobile_clients[player_no].handle_hit_event()

            
        
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
    def __init__(self, websocket, player_no, room):
        self.player_no = player_no
        super().__init__(websocket, f"mobile_{player_no}", "mobile", room)
    

    async def handle_calibration_event(self, data):
        position = data['position']
        x = float(data['x'])
        y = float(data['y'])
        await self.room.add_calibration_data(position, x, y, self.player_no)
        print(f"Calibration for {position}: {self.room.calibrations[self.player_no]['x'][position]}")

    async def handle_fire_event(self):
        await self.room.fire(self.player_no)
    
    async def handle_update_event(self, data):
        await self.room.update_cursor_position(self.player_no, float(data['x']), float(data['y']))

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
        elif data['type'] == "reload":
            await self.handle_reload_event()
    
    async def handle_reload_event(self):
        await self.room.reload(self.player_no)
        
    async def handle_hit_event(self):
        await self.send_message(json.dumps({"type": "hit"}))

class ComputerClient(Client):
    def __init__(self, websocket, id,room):
        super().__init__(websocket, id, "computer", room)

    async def handle_reload_event(self, player_no: int, bullets: list[int]):
        await self.send_message(json.dumps({"type": "reload", "player_no": player_no, "bullets": bullets}))
        
    async def handle_fire_event(self, player_no: int):
        print(f"Handling fire event for player {player_no}")
        await self.send_message(json.dumps({"type": "fire", "player_no": player_no}))
    
    async def handle_update_event(self, data, player_no: int):
        await self.send_message(json.dumps({"type": "update", "player_no": player_no, "x": data['x'], "y": data['y']}))

    async def on_calibration_complete(self, player_no: int):
        await self.send_message(json.dumps({"type": "calibration_complete", "player_no": player_no}))

    async def handle_player_disconnect(self, player_no: int):
        await self.send_message(json.dumps({"type": "disconnect", "player_no": player_no}))
    
    async def fire(self, player_no: int, bullets: int):
        await self.send_message(json.dumps({"type": "fire", "player_no": player_no, "bullets": bullets}))

    async def new_player_connected(self, player_no: int, already_calibrated: bool = False):
        await self.send_message(json.dumps({"type": "new_player", "player_no": player_no, "already_calibrated": already_calibrated}))
        await self.request_calibration(self.room.current_calibration_position[player_no], player_no)

    async def request_calibration(self, new_calibration, player_no: int):
        await self.send_message(json.dumps({"type": "request_calibration", "position": new_calibration, "player_no": player_no}))

    async def handle_hit_event(self, player_no: int):
        await self.room.hit(player_no)
    
    async def update(self):
        data = await self.receive_message()
        data = json.loads(data)
        if data['type'] == "hit":
            await self.handle_hit_event(data['player_no'])
