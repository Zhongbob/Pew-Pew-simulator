import * as THREE from 'three';
import { scene, camera } from './main.js';
import { stopSpawnZombies, clickableObjects, removeClickableObject, zombies, boss, getSpawnersLoc, killBoss } from './zombie.js';



// Set up raycaster and mouse vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


export function displayClickables(){
    console.log(clickableObjects);
}


export function win(){
    stopSpawnZombies();
}

export function checkDie(){
    const hp = document.getElementById("hp");
    let currentHP = parseInt(hp.textContent);
    if (currentHP <= 0){
        const deadScreen = document.querySelector('.dead-screen');
        deadScreen.classList.remove('hide');
        const deadButton = document.querySelector('.dead-button');
        deadButton.addEventListener('click', () => {
            window.location.reload();
        });
        stopSpawnZombies();
        killBoss();
    }
}


function updateKillCounter(){
    const counter = document.getElementById("ghostkilled");
    counter.textContent ++; 
}


export function updatehealth(value){
    const hp = document.getElementById("hp");
    let currentHP = parseInt(hp.textContent);
    currentHP += value;
    hp.textContent = currentHP;
}

/**
 * Core shooting logic at given screen coordinates
 * @param {number} x - X coordinate (in pixels)
 * @param {number} y - Y coordinate (in pixels)
 */
export function shoot(x, y) {
    x = x * window.innerWidth / 100;
    y = y * window.innerHeight / 100;
    console.log('Shoot at:', x, y);

    // Convert to normalized device coordinates
    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;

    // Create visual click indicator
    createClickDot(x, y);

    raycaster.setFromCamera(mouse, camera);

    // === Check Boss First ===
    if (boss) {
        const bossIntersects = raycaster.intersectObject(boss, true);
        if (bossIntersects.length > 0) {
            console.log('Boss hit!');
            boss.userData.hp -= 1;
            console.log(`Boss HP remaining: ${boss.userData.hp}`);

            if (boss.userData.hp <= 0) {
                console.log("Boss defeated!");
                scene.remove(boss);
                killBoss();
                updateKillCounter();
                win();
            } else {
                // Teleport boss away
                const arr = getSpawnersLoc();
                if (arr.length > 0) {
                    const randomSpawnerPoint = arr[Math.floor(Math.random() * arr.length)];
                    boss.position.copy(randomSpawnerPoint);
                    console.log("Boss hit but still alive, teleported away");
                }
            }
            return; // Exit early if boss was hit
        }
    }

    // === Check Other Clickable Objects ===
    const intersects = raycaster.intersectObjects(clickableObjects, true);
    console.log('Intersects found:', intersects.length);
    console.log('Clickable objects in list:', clickableObjects.length);

    if (intersects.length > 0) {
        const hitObject = intersects[0].object;
        console.log('Hit object:', hitObject);

        // Find the actual clickable object (might be a parent)
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

        // Remove from scene
        scene.remove(targetObject);

        // If it's a ghost, remove from zombies array
        if (targetObject.userData.tag === 'ghost') {
            const zombieIndex = zombies.findIndex(z => z.uuid === targetObject.uuid);
            if (zombieIndex > -1) {
                zombies.splice(zombieIndex, 1);
                console.log('Zombie removed from zombies array');
            }
        }

        // Remove from clickable objects
        removeClickableObject(targetObject);

        // Increment kill counter
        updateKillCounter();

        console.log('Object removed. Remaining clickable objects:', clickableObjects.length);
    }
}

/**
 * Event handler for mouse clicks
 * @param {MouseEvent} event 
 */
export function shootHandler(event) {
    const x = event ? event.clientX * 100 / window.innerWidth : 50;
    const y = event ? event.clientY * 100 / window.innerHeight : 50;
    shoot(x, y);
}

window.globalShoot = shoot; // Make shoot function globally accessible

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

