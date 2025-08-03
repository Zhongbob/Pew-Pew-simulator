const path = window.location.pathname; 
const pathSegments = path.split('/');
const room_id = pathSegments[3]
const ws = new WebSocket(`wss://${location.host}/computer/${room_id}/ws`);
const playerCrosshairElements = document.querySelectorAll(".player");
const playerInfos = document.querySelectorAll(".player-info");
const playerIds = {

}
const callibrations = {
    "center": [],
    "left": [],
    "right": []
}

const nextCalibration = ["center", "left", "right"];
const positions = {
    "center": 50,
    "left": 1,
    "right": 99
}
let currentCalibrations = {
    1: nextCalibration[0],
    2: nextCalibration[0]
};
const playerColors = {
    1: "blue",
    2: "red"
};
let currentPosition = {
    1: {
        x: 50,
        y: 50
    },
    2: {
        x: 50,
        y: 50
    }
}
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const playerNo = data.player_no;
    const currentCrossHair = playerCrosshairElements[playerNo - 1];
    if (data.type === "calibration_complete") {
        currentCrossHair.style.left = `${positions["center"]}vw`;
        currentCrossHair.style.top = `${positions["center"]}vh`;
        // currentElem.style.display = "none";

    } else if (data.type === "update") {
        let { x, y } = data;
        currentPosition[playerNo] = { x, y };
        if (currentCrossHair) {
            currentCrossHair.style.left = `${x}vw`;
            currentCrossHair.style.top = `${y}vh`;
        }
    } else if (data.type === "request_calibration") {
        currentCalibrations[playerNo] = data.position;
        currentCrossHair.style.left = `${positions[data.position]}vw`;
        currentCrossHair.style.top = `${positions[data.position]}vh`;
    }
    else if (data.type === "fire") {
        shoot(currentPosition[playerNo].x, currentPosition[playerNo].y, playerNo);
        setBulletCount(playerNo, data.bullets[0], data.bullets[1]);
    }
    else if (data.type === "new_player") {
        currentCrossHair.classList.remove("invisible");
        playerInfos[playerNo - 1].classList.remove("invisible");
    }
    else if (data.type === "reload") {
        setBulletCount(playerNo, data.bullets[0], data.bullets[1]);
    }

};

function setBulletCount(playerNo, currentCount, totalCount) {
    const playerInfo = playerInfos[playerNo - 1];
    const bulletCountElement = playerInfo.querySelector(".count");
    bulletCountElement.textContent = `${currentCount}`;
    const totalCountElement = playerInfo.querySelector(".total-count");
    if (totalCount === -1){
        totalCountElement.textContent = "INF";
    } else {
        totalCountElement.textContent = `${totalCount}`;
    }
}
function hit(playerNo){
    ws.send(JSON.stringify({
        type: "hit",
        player_no: playerNo
    }));
}
function sendData(data) {
    ws.send(data);
}
document.onload = () => {
    sendData(JSON.stringify({ client: "computer" }));
}