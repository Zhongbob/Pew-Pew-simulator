const ws = new WebSocket("wss://" + location.host + "/ws?client=computer");
const player1 = document.querySelector(".player1");
const player2 = document.querySelector(".player2");
const playerIds = {

}
const playerElements = {
    1: player1,
    2: player2
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
    const playerId = data.player_id;
    const playerNumber = playerIds[playerId];
    if (data.type === "calibration_complete") {
        const currentElem = playerElements[playerNumber];
        currentElem.style.left = `${positions["center"]}vw`;
        currentElem.style.top = `${positions["center"]}vh`;
        // currentElem.style.display = "none";

    } else if (data.type === "update") {
        let { x, y } = data;
        currentPosition[playerNumber] = { x, y };
        const currentElement = playerElements[playerNumber];
        if (currentElement) {
            currentElement.style.left = `${x}vw`;
            currentElement.style.top = `${y}vh`;
        }
    } else if (data.type === "request_calibration") {
        currentCalibrations[playerId] = data.position;
        const currentElement = playerElements[playerNumber];
        currentElement.style.left = `${positions[data.position]}vw`;
        currentElement.style.top = `${positions[data.position]}vh`;
    }
    else if (data.type === "fire") {
        const currentPlayer = playerElements[playerNumber];
        const cloned_cross = currentPlayer.cloneNode();
        cloned_cross.style.width = "12px";
        cloned_cross.style.height = "12px";
        cloned_cross.style.color = "#ff0000";
        document.body.appendChild(cloned_cross);
        const prevColor = playerColors[playerNumber];
        currentPlayer.style.color = "#ff0000";
        shoot(currentPosition[playerNumber].x, currentPosition[playerNumber].y);
        setTimeout(() => {
            currentPlayer.style.color = prevColor;
        }, 500);
    }
    else if (data.type === "new_player") {
        const playerId = data.player_id;
        const currentPlayerCount = Object.keys(playerIds).length + 1;
        playerIds[playerId] = currentPlayerCount;
        const newPlayerElement = playerElements[currentPlayerCount];
        newPlayerElement.style.display = "flex";
    }

};
function sendData(data) {
    ws.send(data);
}
document.onload = () => {
    sendData(JSON.stringify({ client: "computer" }));
}