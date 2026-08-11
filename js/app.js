// ============================================================
// THREE.JS WEBXR / META QUEST GLB VIEWER
// ============================================================

import * as THREE from "three";

import { OrbitControls }
    from "three/addons/controls/OrbitControls.js";

import { GLTFLoader }
    from "three/addons/loaders/GLTFLoader.js";

import { VRButton }
    from "three/addons/webxr/VRButton.js";



// ============================================================
// SCENE
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x111111);



// ============================================================
// CAMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
);

camera.position.set(5, 5, 5);



// ============================================================
// RENDERER
// ============================================================

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


// ------------------------------------------------------------
// ENABLE WEBXR
// ------------------------------------------------------------

renderer.xr.enabled = true;


// Add canvas to page

document.body.appendChild(
    renderer.domElement
);



// ============================================================
// DESKTOP ORBIT CONTROLS
// ============================================================

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;

controls.dampingFactor = 0.05;



// ============================================================
// LIGHTING
// ============================================================

// General ambient lighting

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    1.5
);

scene.add(ambientLight);


// Directional light

const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    3
);

directionalLight.position.set(
    5,
    10,
    7
);

scene.add(directionalLight);



// ============================================================
// GLTF LOADER
// ============================================================

const loader = new GLTFLoader();



// ============================================================
// MODEL URL
// ============================================================
//
// IMPORTANT:
//
// app.js is located here:
//
// SB_WEBVR/js/app.js
//
// model is located here:
//
// SB_WEBVR/models/12_3_2024.glb
//
// Therefore we go:
//
// ../models/12_3_2024.glb
//
// Using import.meta.url means this works both locally AND
// on a GitHub Pages project site.
//
// For example:
//
// https://jon-marchos.github.io/SB_WEBVR/js/app.js
//
// automatically resolves to:
//
// https://jon-marchos.github.io/SB_WEBVR/models/12_3_2024.glb
//
// ============================================================

const modelURL = new URL(
    "../models/12_3_2024.glb",
    import.meta.url
);



// ============================================================
// DEBUG URLS
// ============================================================

console.log(
    "--------------------------------------"
);

console.log(
    "APP.JS URL:"
);

console.log(
    import.meta.url
);


console.log(
    "GLB URL:"
);

console.log(
    modelURL.href
);

console.log(
    "--------------------------------------"
);



// ============================================================
// LOAD GLB MODEL
// ============================================================

loader.load(

    modelURL.href,


    // --------------------------------------------------------
    // MODEL SUCCESSFULLY LOADED
    // --------------------------------------------------------

    function (gltf) {

        console.log(
            "GLB loaded successfully!"
        );


        const model = gltf.scene;


        scene.add(model);



        // ----------------------------------------------------
        // CALCULATE MODEL BOUNDING BOX
        // ----------------------------------------------------

        const box = new THREE.Box3()
            .setFromObject(model);


        const size = box.getSize(
            new THREE.Vector3()
        );


        const center = box.getCenter(
            new THREE.Vector3()
        );



        // Debug model dimensions

        console.log(
            "Model size:",
            size
        );


        console.log(
            "Model center:",
            center
        );



        // ----------------------------------------------------
        // CENTER MODEL
        // ----------------------------------------------------

        model.position.x -= center.x;

        model.position.y -= center.y;

        model.position.z -= center.z;



        // ----------------------------------------------------
        // DETERMINE LARGEST DIMENSION
        // ----------------------------------------------------

        const maxDimension = Math.max(
            size.x,
            size.y,
            size.z
        );



        // ----------------------------------------------------
        // AUTOMATIC DESKTOP CAMERA POSITION
        // ----------------------------------------------------

        const cameraDistance =
            maxDimension * 1.5;


        camera.position.set(
            cameraDistance,
            cameraDistance * 0.75,
            cameraDistance
        );



        // ----------------------------------------------------
        // ORBIT AROUND CENTER OF MODEL
        // ----------------------------------------------------

        controls.target.set(
            0,
            0,
            0
        );


        controls.update();



        console.log(
            "Camera positioned at:",
            camera.position
        );

    },



    // --------------------------------------------------------
    // LOADING PROGRESS
    // --------------------------------------------------------

    function (xhr) {

        if (xhr.total > 0) {

            const percent =
                (xhr.loaded / xhr.total) * 100;


            console.log(
                "Model loading:",
                percent.toFixed(1) + "%"
            );

        }

    },



    // --------------------------------------------------------
    // LOADING ERROR
    // --------------------------------------------------------

    function (error) {

        console.error(
            "======================================"
        );

        console.error(
            "GLB LOADING FAILED"
        );

        console.error(
            "Attempted URL:"
        );

        console.error(
            modelURL.href
        );

        console.error(
            "Loader error:"
        );

        console.error(
            error
        );

        console.error(
            "======================================"
        );

    }

);



// ============================================================
// USER INTERFACE
// ============================================================

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



// ============================================================
// CURRENT VIEW MODE
// ============================================================

let currentMode = "desktop";



// ============================================================
// CREATE THREE.JS VR BUTTON
// ============================================================

const vrButton = VRButton.createButton(
    renderer
);


vrButtonContainer.appendChild(
    vrButton
);



// ============================================================
// STYLE THREE.JS VR BUTTON
// ============================================================
//
// Three.js puts its own inline styles on VRButton,
// so we're overriding them here.
// ============================================================

vrButton.style.position = "relative";

vrButton.style.left = "auto";

vrButton.style.right = "auto";

vrButton.style.bottom = "auto";


vrButton.style.width = "auto";


vrButton.style.fontFamily =
    "Helvetica, Arial, sans-serif";


vrButton.style.fontSize =
    "11px";


vrButton.style.fontWeight =
    "500";


vrButton.style.letterSpacing =
    "0.7px";


vrButton.style.padding =
    "10px 18px";


vrButton.style.borderRadius =
    "8px";


vrButton.style.background =
    "rgba(25, 25, 25, 0.65)";


vrButton.style.color =
    "white";


vrButton.style.border =
    "1px solid rgba(255,255,255,0.15)";


vrButton.style.cursor =
    "pointer";



// ============================================================
// DESKTOP MODE
// ============================================================

desktopButton.addEventListener(

    "click",

    function () {

        console.log(
            "Switching to DESKTOP mode"
        );


        currentMode = "desktop";


        // --------------------------------
        // Update UI
        // --------------------------------

        desktopButton
            .classList
            .add("active");


        questButton
            .classList
            .remove("active");



        // --------------------------------
        // Hide ENTER VR button
        // --------------------------------

        vrButtonContainer.style.display =
            "none";



        // --------------------------------
        // Enable OrbitControls
        // --------------------------------

        controls.enabled = true;

    }

);



// ============================================================
// META QUEST MODE
// ============================================================

questButton.addEventListener(

    "click",

    function () {

        console.log(
            "Switching to META QUEST mode"
        );


        currentMode = "quest";


        // --------------------------------
        // Update UI
        // --------------------------------

        questButton
            .classList
            .add("active");


        desktopButton
            .classList
            .remove("active");



        // --------------------------------
        // Show ENTER VR button
        // --------------------------------

        vrButtonContainer.style.display =
            "block";



        // --------------------------------
        // Disable desktop OrbitControls
        // --------------------------------

        controls.enabled = false;

    }

);



// ============================================================
// WEBXR DEBUGGING
// ============================================================

console.log(
    "======================================"
);

console.log(
    "WEBXR DEBUG"
);


console.log(
    "Secure context:",
    window.isSecureContext
);


console.log(
    "navigator.xr:",
    navigator.xr
);



// ============================================================
// CHECK FOR IMMERSIVE VR SUPPORT
// ============================================================

if (navigator.xr) {

    navigator.xr
        .isSessionSupported(
            "immersive-vr"
        )

        .then(

            function (supported) {

                console.log(
                    "Immersive VR supported:",
                    supported
                );


                if (supported) {

                    console.log(
                        "WebXR VR is ready!"
                    );

                }

                else {

                    console.warn(
                        "Browser does not report immersive-vr support."
                    );

                }

            }

        )

        .catch(

            function (error) {

                console.error(
                    "WebXR support check failed:",
                    error
                );

            }

        );

}

else {

    console.warn(
        "navigator.xr does not exist."
    );


    console.warn(
        "WebXR is unavailable in this browser/context."
    );

}


console.log(
    "======================================"
);



// ============================================================
// WEBXR SESSION EVENTS
// ============================================================

renderer.xr.addEventListener(

    "sessionstart",

    function () {

        console.log(
            "WebXR session started!"
        );

    }

);


renderer.xr.addEventListener(

    "sessionend",

    function () {

        console.log(
            "WebXR session ended."
        );

    }

);



// ============================================================
// WINDOW RESIZE
// ============================================================

window.addEventListener(

    "resize",

    function () {

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



// ============================================================
// ANIMATION / RENDER LOOP
// ============================================================

function animate() {


    // Desktop controls should only update
    // while we're in desktop mode.

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



// ============================================================
// START RENDER LOOP
// ============================================================
//
// setAnimationLoop() is required instead of the traditional:
//
// requestAnimationFrame()
//
// because WebXR needs to control the render loop when
// the headset enters immersive VR.
// ============================================================

renderer.setAnimationLoop(
    animate
);