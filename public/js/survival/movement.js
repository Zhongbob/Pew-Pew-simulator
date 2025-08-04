// Controls
import { camera, clock } from "./main.js";
const forwardButton = document.querySelector('.forward');
const backwardButton = document.querySelector('.backward');
const forwardBound = forwardButton.getBoundingClientRect();
const backwardBound = backwardButton.getBoundingClientRect();
const keysPressed = {
    w: false,
    a: false,
    s: false,
    d: false,
};


export function setUpEventListeners(){
    // Setting up event listeners for movement
    // window.addEventListener('keydown', (event) => {
    //     const key = event.key.toLowerCase();
    //     if (key in keysPressed) keysPressed[key] = true;
    // });

    // window.addEventListener('keyup', (event) => {
    //     const key = event.key.toLowerCase();
    //     if (key in keysPressed) keysPressed[key] = false;
    // });        
}

    const walkSpeed = 0.015;
    const turnSpeed = 0.03;

export function handleMovement(camera, clock){
    // Takes in camera and clock object and handles movement
    const delta = clock.getElapsedTime();
    const angle = camera.rotation.y;


    // Forward / backward
    if (keysPressed.w || keysPressed.s) {
        camera.position.y = 0.12 + Math.sin(delta * 30) * 0.01; // bobbing
    } else {
        camera.position.y = 0.12; // reset when not moving forward/backward
    }   
    if (keysPressed.w) {
        camera.position.x -= Math.sin(angle) * walkSpeed;
        camera.position.z -= Math.cos(angle) * walkSpeed;
        camera.position.y = 0.12 + Math.sin(delta * 26) * 0.01; 
    }
    if (keysPressed.s) {
        camera.position.x += Math.sin(angle) * walkSpeed;
        camera.position.z += Math.cos(angle) * walkSpeed;
    }

    // Left / right rotation (in place)
    if (keysPressed.a) camera.rotation.y += turnSpeed;
    if (keysPressed.d) camera.rotation.y -= turnSpeed;   
}


    


function updatePlayerPosition(playerNo, x, y) {
    const xPixel = x / 100 * window.innerWidth;
    const yPixel = y / 100 * window.innerHeight;
    if (forwardBound.left <= xPixel && xPixel <= forwardBound.right &&
        forwardBound.top <= yPixel && yPixel <= forwardBound.bottom) {
        keysPressed.w = true;
    }
    else{
        keysPressed.w = false;
    }
    if (backwardBound.left <= xPixel && xPixel <= backwardBound.right &&
        backwardBound.top <= yPixel && yPixel <= backwardBound.bottom) {
        keysPressed.s = true;
    }
    else{
        keysPressed.s = false;
    }

    if (x < 5) {
        keysPressed.a = true;
    }
    else {
        keysPressed.a = false;
    }

    if (x > 95) {
        keysPressed.d = true;
    }
    else {
        keysPressed.d = false;
    }
}

window.updatePlayerPosition = updatePlayerPosition;
    