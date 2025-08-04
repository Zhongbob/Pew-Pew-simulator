import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { launchEditorMode, stopEditorMode } from './terrainEditor/editorSetup.js';
import { setUpEventListeners, handleMovement } from './movement.js';
import { spawnZombies, stopSpawnZombies, spawnZombiesInterval, updateZombies, spawnBossZombie } from './zombie.js';
import { shootclick, checkDie } from './combat.js';
import { initWorld } from './world.js';
import { checkHealthPotionCollisions } from './health.js';

export let scene, camera, renderer, plane, axes, controls, clock;

function setup() {
    // Setting up scene and renderer
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    clock = new THREE.Clock();

    scene.background = new THREE.Color(0x00000F);  // blue background
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    renderer.domElement.classList.add("game-canvas");
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";


    // Setting up camera
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
    camera.position.set(0, 10, 10);
    camera.lookAt(0, 0, 0);  

    
    // Load texture
    const textureLoader = new THREE.TextureLoader();
    const grassTexture = textureLoader.load('/public/assets/survival/ground.jpg');

    // Setting up plane
    const geometry = new THREE.PlaneGeometry(5, 5);
    const material = new THREE.MeshBasicMaterial({ map: grassTexture, side: THREE.DoubleSide });;
    plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    // Setting up light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Setting up axis
    axes = new THREE.AxesHelper(5);
    scene.add(axes);
    
    
    // OrbitControls (camera follows mouse)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0); // Look at the center
    controls.update();
    editorMode = false;
    console.log("Game started, editorMode is now", editorMode);
    // Game setup starts here
    gameSetup();
    shootclick();
}


function animate() {
    if (!editorMode){
        // Game logic and movement starts here
        handleMovement(camera, clock)
        updateZombies();
        spawnBossZombie();
        checkHealthPotionCollisions();
        checkDie();
    }


    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    
}

function gameSetup(){
    // Remove window listener for edits
    stopEditorMode();
    // Remove edit UI elements
    scene.remove(axes);
    axes = null;
    controls.dispose();
    controls = null;
    initWorld(); // Initialize the world with models
    // Fix camera positions
    camera.position.set(0, 1.6, 3);
    camera.lookAt(0, 1.6, 0);
    
    // Setup WASD movement listeners
    setUpEventListeners()
}


// Game Flow
let editorMode = true;
const startBtn = document.getElementById("start-btn");
startBtn.onclick = () => {
    editorMode = false;
    console.log("Game started, editorMode is now", editorMode);
    // Game setup starts here
    gameSetup();
    shootclick();
};
window.globalStartLevel = () => {
    spawnZombies();
    spawnZombiesInterval(5000); // Start spawning zombies every 5 seconds
}
setup();
if (editorMode) launchEditorMode();
animate();