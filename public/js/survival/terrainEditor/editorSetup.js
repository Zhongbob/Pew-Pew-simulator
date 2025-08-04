import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene, camera, plane } from '../main.js';

// Set up loader for 3D models
const GLTFloader = new GLTFLoader();

// Set up raycaster and mouse vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Select model via buttons
let selectedModel = null;
document.querySelectorAll('button[data-model]').forEach(btn => {
    btn.onclick = () => selectedModel = btn.dataset.model;
});


// Putting models in
const modelScales = {
    tree: 0.1,
    spawner: 0.2
};

const modelCache = {};  // Store loaded base models
const objects = {}
function loadModel(point) {
    if (selectedModel === null) {
        console.warn("No model selected");
        return;
    }
    if (!(selectedModel in objects)) {
        objects[selectedModel] = [];
    }
    objects[selectedModel].push(point);
    console.log(`Objects placed`)
    console.log(objects)
    if (modelCache[selectedModel]) {
        const clone = modelCache[selectedModel].clone(true);
        clone.scale.setScalar(modelScales[selectedModel] || 0.05);
        clone.position.copy(point);
        clone.userData.tag = selectedModel;
        scene.add(clone);
    } else {
        GLTFloader.load(`/public/assets/survival/${selectedModel}.glb`, function (gltf) {
            const baseModel = gltf.scene;
            modelCache[selectedModel] = baseModel;

            const clone = baseModel.clone(true);
            clone.scale.setScalar(modelScales[selectedModel] || 0.05);
            clone.position.copy(point);
            clone.userData.tag = selectedModel;
            scene.add(clone);
        });
    }
}

let point;
function editorClickHandler(event){
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse
    raycaster.setFromCamera(mouse, camera);

    // Check for intersection with the plane
    const intersects = raycaster.intersectObject(plane);

    if (intersects.length > 0) {
        point = intersects[0].point;
        console.log(`Clicked at: x=${point.x.toFixed(2)}, z=${point.z.toFixed(2)}`);

        // Placing asset at pointed area
        loadModel(point);

        console.log(`Placed point at: x=${point.x.toFixed(2)}, z=${point.z.toFixed(2)}`);
  }
}

export function launchEditorMode(){
    window.addEventListener("click", editorClickHandler);
}

export function stopEditorMode(){
    window.removeEventListener("click", editorClickHandler);
}
