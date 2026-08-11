import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';


// ----------------------------------------------------
// SCENE
// ----------------------------------------------------

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x111111);


// ----------------------------------------------------
// CAMERA
// ----------------------------------------------------

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
);

camera.position.set(5, 5, 5);


// ----------------------------------------------------
// RENDERER
// ----------------------------------------------------

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.xr.enabled = true;

document.body.appendChild(
    renderer.domElement
);


// ----------------------------------------------------
// DESKTOP CONTROLS
// ----------------------------------------------------

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;


// ----------------------------------------------------
// LIGHTING
// ----------------------------------------------------

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        1.5
    );

scene.add(ambientLight);


const directionalLight =
    new THREE.DirectionalLight(
        0xffffff,
        3
    );

directionalLight.position.set(
    5,
    10,
    7
);

scene.add(directionalLight);


// ----------------------------------------------------
// LOAD MODEL
// ----------------------------------------------------

const loader = new GLTFLoader();

loader.load(

    "../models/12_3_2024.glb",

    function (gltf) {

        const model = gltf.scene;

        scene.add(model);


        // Get model bounds

        const box =
            new THREE.Box3()
            .setFromObject(model);

        const size =
            box.getSize(
                new THREE.Vector3()
            );

        const center =
            box.getCenter(
                new THREE.Vector3()
            );


        // Center model

        model.position.x -= center.x;
        model.position.y -= center.y;
        model.position.z -= center.z;


        // Desktop camera distance

        const maxDimension =
            Math.max(
                size.x,
                size.y,
                size.z
            );

        const cameraDistance =
            maxDimension * 1.5;


        camera.position.set(

            cameraDistance,

            cameraDistance * 0.75,

            cameraDistance

        );


        controls.target.set(
            0,
            0,
            0
        );

        controls.update();

    },

    undefined,

    function (error) {

        console.error(
            "GLB loading error:",
            error
        );

    }

);


// ----------------------------------------------------
// MODE SWITCH
// ----------------------------------------------------

const desktopButton =
    document.getElementById(
        "desktop-button"
    );

const questButton =
    document.getElementById(
        "quest-button"
    );

const vrButtonContainer =
    document.getElementById(
        "vr-button-container"
    );


let currentMode = "desktop";


// ----------------------------------------------------
// VR BUTTON
// ----------------------------------------------------

const vrButton =
    VRButton.createButton(renderer);

vrButtonContainer.appendChild(vrButton);


// Override default Three.js positioning

vrButton.style.position = "relative";

vrButton.style.left = "auto";
vrButton.style.right = "auto";
vrButton.style.bottom = "auto";

vrButton.style.fontFamily =
    "Helvetica, Arial, sans-serif";

vrButton.style.fontSize = "11px";

vrButton.style.letterSpacing =
    "0.7px";

vrButton.style.borderRadius =
    "8px";

vrButton.style.background =
    "rgba(25, 25, 25, 0.65)";


// ----------------------------------------------------
// DESKTOP MODE
// ----------------------------------------------------

desktopButton.addEventListener(
    "click",
    () => {

        currentMode = "desktop";

        desktopButton
            .classList
            .add("active");

        questButton
            .classList
            .remove("active");

        vrButtonContainer.style.display =
            "none";

        controls.enabled = true;

    }
);


// ----------------------------------------------------
// QUEST MODE
// ----------------------------------------------------

questButton.addEventListener(
    "click",
    () => {

        currentMode = "quest";

        questButton
            .classList
            .add("active");

        desktopButton
            .classList
            .remove("active");

        vrButtonContainer.style.display =
            "block";

        controls.enabled = false;

    }
);


// ----------------------------------------------------
// WINDOW RESIZE
// ----------------------------------------------------

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


// ----------------------------------------------------
// RENDER LOOP
// ----------------------------------------------------

function animate() {

    if (
        currentMode === "desktop"
    ) {

        controls.update();

    }

    renderer.render(
        scene,
        camera
    );

}

renderer.setAnimationLoop(animate);