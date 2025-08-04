import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene} from './main.js';

// Set up loader for 3D models
const GLTFloader = new GLTFLoader();


const objects = {
    "tree": [
        {
            "x": -1.7427214000174074,
            "y": 1.5095969914457456e-16,
            "z": -0.6798620448154682
        },
        {
            "x": -0.8688271047093035,
            "y": -3.2118343889601283e-16,
            "z": 1.4464816157296578
        },
        {
            "x": -0.5383598201820963,
            "y": -5.171452122355879e-16,
            "z": 2.32901498512063
        },
        {
            "x": 0.512724993061425,
            "y": 2.518751426174485e-16,
            "z": -1.1343447984358317
        },
        {
            "x": 1.0460973703331353,
            "y": -1.0698637972820236e-16,
            "z": 0.48182381987765055
        },
        {
            "x": 1.4695223064989449,
            "y": -4.545064047299922e-16,
            "z": 2.0469148749794965
        },
        {
            "x": -1.6636056670613821,
            "y": -4.286327884093067e-16,
            "z": 1.9303904661589304
        },
        {
            "x": 2.1044629343256607,
            "y": 2.957287812674004e-16,
            "z": 0.6681559708814047
        },
        {
            "x": 1.0258142445683984,
            "y": 3.113976142797993e-16,
            "z": -1.4024101796345656
        }
    ],
    "spawner": [
        {
            "x": -2.199431465247467,
            "y": -2.420688331357251e-16,
            "z": 1.0901811067080622
        },
        {
            "x": -1.6576969308671692,
            "y": 4.1004958747066034e-16,
            "z": -1.8466991693362915
        },
        {
            "x": 2.1030711496512264,
            "y": 2.1040835860051002e-16,
            "z": -0.9475950053888946
        }
    ],
    "plant": [
        {
            "x": -0.715901108911073,
            "y": -4.48009475130821e-16,
            "z": 2.017655305257617
        },
        {
            "x": -1.7507567753948867,
            "y": -6.559012503949849e-17,
            "z": 0.2953916626870696
        },
        {
            "x": -1.4139804489037062,
            "y": -2.667163641159372e-16,
            "z": 1.2011837180461482
        },
        {
            "x": -1.5592913672026245,
            "y": -5.45281177786208e-16,
            "z": 1.955728109090112
        }
    ],
    "healthpot": [
        {
            "x": -0.3422182363704733,
            "y": -2.2348333588510383e-16,
            "z": 1.006479468215669
        },
        {
            "x": 0.41313041716062626,
            "y": -3.252172114124451e-16,
            "z": 1.9646481121315595
        },
        {
            "x": -0.755691059860647,
            "y": -5.563420894595552e-17,
            "z": -0.2494457973219424
        }
    ]
}
const modelCache = {};
const modelScales = {
    tree: 0.1,
    spawner: 0.2,
    plant: 0.15,
    healthpot: 0.007,
};
function loadModel(point, selectedModel) {
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

export function initWorld() {
    for (const [key, points] of Object.entries(objects)) {
        points.forEach(point => {
            loadModel(point, key);
        });
    }
}
