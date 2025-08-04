import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene, camera } from './main.js';
import { updatehealth } from "./combat.js";

const GLTFloader = new GLTFLoader();
window.waveCount = 0; // Track the number of waves

// Spawners logic
const spawners = [];

export function getSpawnersLoc() {
  const taggedMeshes = [];
  scene.traverse((object) => {
    if (object.userData.tag === "spawner") {
      // Only add if not already in spawners array
      if (!spawners.find(spawner => spawner.uuid === object.uuid)) {
        spawners.push(object);
      }
      taggedMeshes.push(object.position.clone());
    }
  });
  return taggedMeshes;
}


// Loading monster and monster logic
//const selectedModel = "ghost";
export const zombies = []; // Store zombies
const modelCache = {};  // Store loaded base models


const modelScales = {
    ghost: 0.02,
    grim_reaper: 0.002
}

function loadZombie(point, selectedModel) {
    if (modelCache[selectedModel]) {
        const clone = modelCache[selectedModel].clone(true);
        clone.scale.setScalar(modelScales[selectedModel]);
        clone.position.copy(point);
        clone.userData.tag = selectedModel;
        clone.userData.swaySeed = Math.random() * 100000;
        zombies.push(clone);
        scene.add(clone);
        addClickableObject(clone);
        
    } else {
        GLTFloader.load(`/public/assets/survival/${selectedModel}.glb`, function (gltf) {
            const baseModel = gltf.scene;
            modelCache[selectedModel] = baseModel;

            const clone = baseModel.clone(true);
            clone.scale.setScalar(modelScales[selectedModel]);
            clone.position.copy(point);
            clone.userData.tag = selectedModel;
            clone.userData.swaySeed = Math.random() * 10000;
            zombies.push(clone);
            scene.add(clone);
            addClickableObject(clone);
        });
    }
}


export function spawnZombies(type){
    const arr = getSpawnersLoc();
    if (type === "grim_reaper"){
        const sound = new Audio('/public/sounds/boss_spawn.mp3');
        sound.play();
        const randomSpawnerPoint = arr[Math.floor(Math.random() * arr.length)];
        loadZombie(randomSpawnerPoint, type);

    }else{
    arr.forEach(point => {
        console.log("zombie spawned")
        loadZombie(point, type);
    });
    }
}

let timeOutId = null; 
export function spawnZombiesInterval(){
    let currentCooldown = 7000 - (window.waveCount * 1000); // Decrease cooldown with each wave
    if (currentCooldown < 1000) currentCooldown = 3000; // Minimum cooldown of 3 seconds
    function spawnZombieEvent() {
        timeOutId = setTimeout(() => {
            spawnZombies("ghost");
            spawnZombieEvent();
        }, currentCooldown + (Math.random() -0.5)* 1000); // Add some randomness to the spawn time
    }
    spawnZombieEvent();

}

export function stopSpawnZombies(){
    clearTimeout(timeOutId);
    timeOutId = null; 
}

function followCamera(follower, followSpeed = 0.004) {
    const cameraPosition = camera.position.clone();
    const direction = cameraPosition.sub(follower.position).normalize();

    const time = performance.now() * 0.001;
    const swayX = Math.sin(time + follower.userData.swaySeed) * 0.2;
    const swayZ = Math.cos(time + follower.userData.swaySeed) * 0.2;

    direction.x += swayX;
    direction.z += swayZ;
    direction.normalize();

    const distance = follower.position.distanceTo(camera.position);

    // Follower is Boss
    if (follower.userData.tag === "boss"){
        if (distance > 0.2) {
            follower.position.add(direction.multiplyScalar(followSpeed));
        } else {
            const arr = getSpawnersLoc();
            const randomSpawnerPoint = arr[Math.floor(Math.random() * arr.length)];
            follower.position.copy(randomSpawnerPoint);
            // Fix the hit counter increment
            updatehealth(-3)
        }
        return;
    }
    // Follower is normal monster
    if (distance > 0.2) {
        follower.position.add(direction.multiplyScalar(followSpeed));
    } else {
        scene.remove(follower);
        const index = zombies.findIndex(z => z.uuid === follower.uuid);
        if (index > -1) zombies.splice(index, 1);
        
        removeClickableObject(follower); // Add this line
        
        // Fix the hit counter increment
        updatehealth(-1)
    }
}

export function updateZombies() {
    const speed = 0.005;  // adjust movement speed
    zombies.forEach(zombie => {
        if (zombie){
            zombie.rotation.y += 0.01;
            followCamera(zombie);
        }
    });
    if (boss){
        followCamera(boss, 0.02);
    }
}

// Clickable objects to allow shooting
export const clickableObjects = []; 

function addClickableObject(object) {
    if (!clickableObjects.includes(object)) {
        clickableObjects.push(object);
    }
}

export function removeClickableObject(object) {
    console.log('Removing object with UUID:', object.uuid);
    console.log('Objects before removal:', clickableObjects.length);
    
    const index = clickableObjects.findIndex(obj => obj.uuid === object.uuid);
    console.log('Found index:', index);
    
    if (index > -1) {
        clickableObjects.splice(index, 1);
        console.log('Objects after removal:', clickableObjects.length);
    } else {
        console.log('Object not found in clickableObjects array');
    }
}


// Boss monster logic (kill 20 ghosts, stop spawning ghosts, need to hit it 10 times to kill)
export let boss;
export function spawnBossZombie() {
    const counter = document.getElementById("ghostkilled");

    if (!counter) return; // safety check
    const kills = parseInt(counter.textContent);
    let requiredKills = 20;

    if (kills - waveCount * 20 >= requiredKills && !window.bossSpawned) {
        window.bossSpawned = true;
        console.log("Boss spawning");
        stopSpawnZombies(); 

        // Spawn the boss zombie
        //spawnZombies("grim_reaper");
        const arr = getSpawnersLoc()
        const randomSpawnerPoint = arr[Math.floor(Math.random() * arr.length)];
        loadBoss(randomSpawnerPoint, "grim_reaper");
    }
}


function loadBoss(point, selectedModel){
    const sound = new Audio('/public/sounds/boss_spawn.mp3');
    sound.play();
    GLTFloader.load(`/public/assets/survival/${selectedModel}.glb`, function (gltf) {
        const baseModel = gltf.scene;
        boss = baseModel.clone(true);
        boss.scale.setScalar(modelScales[selectedModel]);
        boss.position.copy(point);
        boss.userData.tag = "boss";
        boss.userData.swaySeed = Math.random() * 10000;
        boss.userData.hp = 10;
        scene.add(boss);
    });
}

export function killBoss(){
    scene.remove(boss);
    boss = null;
}