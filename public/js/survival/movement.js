// Controls
import { camera, clock } from "./main.js";

const keysPressed = {
    1: { w: false, a: false, s: false, d: false },
    2: { w: false, a: false, s: false, d: false },
    3: { w: false, a: false, s: false, d: false },
    4: { w: false, a: false, s: false, d: false }
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
    const keysPressedValues = Object.values(keysPressed);

    // Check if any keys are pressed
    const anyKeyPressedEach = keysPressedValues.reduce((acc, curr) => {
        for (const key in acc) {
            acc[key] = curr[key] || acc[key];
        }
        return acc;
    }, {
        w: false,
        a: false,
        s: false,
        d: false
    });

    // Forward / backward
    if (anyKeyPressedEach.w || anyKeyPressedEach.s) {
        camera.position.y = 0.12 + Math.sin(delta * 30) * 0.01; // bobbing
    } else {
        camera.position.y = 0.12; // reset when not moving forward/backward
    }   
    if (anyKeyPressedEach.w) {
        camera.position.x -= Math.sin(angle) * walkSpeed;
        camera.position.z -= Math.cos(angle) * walkSpeed;
        camera.position.y = 0.12 + Math.sin(delta * 26) * 0.01; 
    }
    if (anyKeyPressedEach.s) {
        camera.position.x += Math.sin(angle) * walkSpeed;
        camera.position.z += Math.cos(angle) * walkSpeed;
    }

    // Left / right rotation (in place)
    if (anyKeyPressedEach.a) camera.rotation.y += turnSpeed;
    if (anyKeyPressedEach.d) camera.rotation.y -= turnSpeed;   
}


    


function updatePlayerPosition(playerNo, x, y) {

    if (y < 5) {
        keysPressed[playerNo].w = true;
    }
    else{
        keysPressed[playerNo].w = false;
    }
    if (y >95 ) {
        keysPressed[playerNo].s = true;
    }
    else{
        keysPressed[playerNo].s = false;
    }

    if (x < 5) {
        keysPressed[playerNo].a = true;
    }
    else {
        keysPressed[playerNo].a = false;
    }

    if (x > 95) {
        keysPressed[playerNo].d = true;
    }
    else {
        keysPressed[playerNo].d = false;
    }
}

window.updatePlayerPosition = updatePlayerPosition;
    