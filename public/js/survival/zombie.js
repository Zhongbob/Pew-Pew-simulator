import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene, camera } from './main.js';

const GLTFloader = new GLTFLoader();
const spawners = [];
function getSpawnersLoc() {
  const taggedMeshes = [];
  scene.traverse((object) => {
    if (object.userData.tag === "spawner") {
      // Only add if not already in spawners array
      if (!spawners.find(spawner => spawner.uuid === object.uuid)) {
        spawners.push(object);
        addClickableObject(object); // Add to clickable objects
      }
      taggedMeshes.push(object.position.clone());
    }
  });
  return taggedMeshes;
}

const selectedModel = "ghost";
const zombies = []; // Store zombies
const modelCache = {};  // Store loaded base models

function loadZombie(point) {
    if (modelCache[selectedModel]) {
        const clone = modelCache[selectedModel].clone(true);
        clone.scale.setScalar(0.02);
        clone.position.copy(point);
        clone.userData.tag = selectedModel;
        clone.userData.swaySeed = Math.random() * 100000;
        zombies.push(clone);
        scene.add(clone);
        addClickableObject(clone); // Add this line
        
    } else {
        GLTFloader.load(`/public/assets/survival/${selectedModel}.glb`, function (gltf) {
            const baseModel = gltf.scene;
            modelCache[selectedModel] = baseModel;

            const clone = baseModel.clone(true);
            clone.scale.setScalar(0.02);
            clone.position.copy(point);
            clone.userData.tag = selectedModel;
            clone.userData.swaySeed = Math.random() * 10000;
            zombies.push(clone);
            scene.add(clone);
            addClickableObject(clone); // Add this line
        });
    }
}

export function spawnZombies(){
    const arr = getSpawnersLoc();
    arr.forEach(point => {
        console.log("zombie spawned")
        loadZombie(point);
    });
}

let intervalId = null; 
export function spawnZombiesInterval(interval){
    intervalId = setInterval(() => {
        spawnZombies();
    }, interval);

}

export function stopSpawnZombies(){
    clearInterval(intervalId);
    intervalId = null; 
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
    if (distance > 0.2) {
        follower.position.add(direction.multiplyScalar(followSpeed));
    } else {
        scene.remove(follower);
        const index = zombies.findIndex(z => z.uuid === follower.uuid);
        if (index > -1) zombies.splice(index, 1);
        
        removeClickableObject(follower); // Add this line
        
        // Fix the hit counter increment
        const hitCounter = document.getElementById("hp");
        let currentValue = parseInt(hitCounter.textContent) || 0;
        hitCounter.textContent = currentValue + 1;
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
}

export const clickableObjects = []; // Add this export

// Add this helper function
function addClickableObject(object) {
    if (!clickableObjects.includes(object)) {
        clickableObjects.push(object);
    }
}

// Add this helper function  
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
