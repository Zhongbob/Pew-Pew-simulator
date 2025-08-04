const path = window.location.pathname; 
const pathSegments = path.split('/');
const room_id = pathSegments[3]
let motionCaptureStarted = false;
const rotations = {
    x: 0,
    y: 0,
    z: 0
}

document.body.onclick = (e) => {
    if (motionCaptureStarted) return;
    motionCaptureStarted = true;
    e.preventDefault();
    try {
        if (
            DeviceMotionEvent &&
            typeof DeviceMotionEvent.requestPermission === 'function'
        ) {
            DeviceMotionEvent.requestPermission()
        }

        window.addEventListener("deviceorientation", handleOrientationEvent);
    }
    catch (error) {
        alert(error);
    }

};

const handleOrientationEvent = (event) => {
    rotations.x = event.alpha.toFixed(2);
    rotations.y = event.beta.toFixed(2);
    rotations.z = event.gamma.toFixed(2);
    if (Number(rotations.z) > 0) {
        rotations.x = 180 + Number(rotations.x);
        rotations.y = 180 + Number(rotations.y);
    }

}
const handleOrientationEvent2 = (event) => {
    const z = event.gamma.toFixed(2);
    let x = event.alpha.toFixed(2);
    let y = event.beta.toFixed(2);
    if (Number(z) > 0) {
        x = 180 + Number(x);
        y = 180 - Number(y);
    }
    sendData(JSON.stringify({
        type: "update",
        x: x,
        y: y
    }));
}
const ws = new WebSocket(`wss://${location.host}/mobile/${room_id}/ws`);
let currentCalibration = "center";
let startShooting = false;
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "request_calibration") {
        currentCalibration = data.position;
    }
    if (data.type === "calibration_complete") {
        startShooting = true;
        window.addEventListener("deviceorientation", handleOrientationEvent2, false);
    }
    if (data.type === "hit") {
        navigator.vibrate(1000);
    }
};
function sendData(data) {
    ws.send(data);
}
document.onload = () => {
    sendData(JSON.stringify({ type: "request_calibration", position: currentCalibration }));
}

const fireButton = document.getElementById("shoot");
fireButton.onclick = (e) => {
    e.preventDefault();
    shoot();
}
function shoot(){
    const {x, y} = rotations;
    if (!motionCaptureStarted) {
        alert("Please allow motion capture first by clicking on the screen.");
        return;
    }
    if (!startShooting) {
        sendData(JSON.stringify({
            type: "calibration",
            position: currentCalibration,
            x: x,
            y: y
        }));
    } else {
        sendData(JSON.stringify({
            type: "fire",
            x: x,
            y: y
        }));
    }

}

function reload(){
    sendData(JSON.stringify({
        type: "reload"
    }));
}