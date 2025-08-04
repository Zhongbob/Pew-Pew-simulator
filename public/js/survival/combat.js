import * as THREE from 'three';
import { scene, camera } from './main.js';
import { clickableObjects, removeClickableObject } from './zombie.js';


// Set up raycaster and mouse vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


export function displayClickables(){
    console.log(clickableObjects);
}

export function checkWin(){
     if (clickableObjects.length === 0) {
        const hp = document.getElementById("hp");
        hp.textContent = "COMPLETED!!"
    }
}

/**
 * Shoots at the given screen coordinates
 * @param {number} x - X coordinate (in pixels)
 * @param {number} y - Y coordinate (in pixels)
 */
export function shoot(x, y, playerNo = null) {
    x = x / 100 * window.innerWidth;
    y = y / 100 * window.innerHeight;
    console.log('Shoot at:', x, y);

    // Convert to normalized device coordinates
    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;

    // Visual indicator
    createClickDot(x, y);

    // Raycast
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects, true);
    console.log('Intersects found:', intersects.length);
    console.log('Clickable objects in list:', clickableObjects.length);

    if (intersects.length > 0) {
        const hitObject = intersects[0].object;
        console.log('Hit object:', hitObject);

        // Find actual clickable object (could be a parent)
        let targetObject = hitObject;
        if (!clickableObjects.includes(hitObject)) {
            let current = hitObject.parent;
            while (current && current !== scene) {
                if (clickableObjects.includes(current)) {
                    targetObject = current;
                    break;
                }
                current = current.parent;
            }
        }

        // Remove from scene & clickable list
        scene.remove(targetObject);
        removeClickableObject(targetObject);

        console.log('Object removed. Remaining clickable objects:', clickableObjects.length);
    }
}

window.globalShoot = shoot; // Make shoot function globally accessible
/**
 * Event handler for mouse clicks
 * @param {MouseEvent} event 
 */
export function shootHandler(event) {
    const x = event ? event.clientX * 100 / window.innerWidth : 50;
    const y = event ? event.clientY * 100 / window.innerHeight : 50;
    shoot(x, y);
}

// Function to create visual click indicators
function createClickDot(x, y) {
    const dot = document.createElement('div');
    dot.style.position = 'fixed';
    dot.style.left = (x - 5) + 'px'; // Center the dot
    dot.style.top = (y - 5) + 'px';  // Center the dot
    dot.style.width = '10px';
    dot.style.height = '10px';
    dot.style.backgroundColor = 'red';
    dot.style.borderRadius = '50%';
    dot.style.pointerEvents = 'none'; // Don't interfere with clicking
    dot.style.zIndex = '9999';
    dot.style.opacity = '0.8';
    
    document.body.appendChild(dot);
    
    // Remove the dot after 2 seconds
    setTimeout(() => {
        if (dot.parentNode) {
            dot.parentNode.removeChild(dot);
        }
    }, 1000);
}
export function shootclick(){
    window.addEventListener("click", shootHandler);
}

