// ============================================================
// THREE.JS WEBXR / META QUEST GLB VIEWER
// ============================================================


import * as THREE from "three";


import {
    OrbitControls
}
from "three/addons/controls/OrbitControls.js";


import {
    GLTFLoader
}
from "three/addons/loaders/GLTFLoader.js";


import {
    VRButton
}
from "three/addons/webxr/VRButton.js";



// ============================================================
// SCENE
// ============================================================

const scene =
    new THREE.Scene();


scene.background =
    new THREE.Color(
        0x111111
    );



// ============================================================
// CAMERA
// ============================================================

const camera =
    new THREE.PerspectiveCamera(

        60,

        window.innerWidth /
        window.innerHeight,

        0.1,

        10000

    );


camera.position.set(
    5,
    5,
    5
);



// ============================================================
// RENDERER
// ============================================================

const renderer =
    new THREE.WebGLRenderer({

        antialias: true

    });


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.setPixelRatio(

    Math.min(
        window.devicePixelRatio,
        2
    )

);



// ============================================================
// ENABLE WEBXR
// ============================================================

renderer.xr.enabled = true;



// ============================================================
// ADD CANVAS TO PAGE
// ============================================================

document.body.appendChild(
    renderer.domElement
);



// ============================================================
// DESKTOP ORBIT CONTROLS
// ============================================================

const controls =
    new OrbitControls(

        camera,
        renderer.domElement

    );


controls.enableDamping = true;


controls.dampingFactor = 0.05;



// ============================================================
// LIGHTING
// ============================================================


// ------------------------------------------------------------
// AMBIENT LIGHT
// ------------------------------------------------------------

const ambientLight =
    new THREE.AmbientLight(

        0xffffff,

        1.5

    );


scene.add(
    ambientLight
);



// ------------------------------------------------------------
// DIRECTIONAL LIGHT
// ------------------------------------------------------------

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


scene.add(
    directionalLight
);



// ============================================================
// GLTF / GLB LOADER
// ============================================================

const loader =
    new GLTFLoader();



// ============================================================
// MODEL PATH
// ============================================================
//
// IMPORTANT:
//
// Your website:
//
// https://jon-marchos.github.io/SB_WebVR/
//
// Your model:
//
// https://jon-marchos.github.io/
// SB_WebVR/models/12_3_2024.glb
//
//
// Because the page is already inside:
//
// /SB_WebVR/
//
// we use:
//
// ./models/12_3_2024.glb
//
// NOT:
//
// /models/12_3_2024.glb
//
// The leading "/" would remove SB_WebVR.
// ============================================================


const modelPath =
    "./models/12_3_2024.glb";



// ============================================================
// DEBUG MODEL PATH
// ============================================================

const resolvedModelURL =
    new URL(

        modelPath,

        window.location.href

    );


console.log(
    "======================================"
);


console.log(
    "Current page URL:"
);


console.log(
    window.location.href
);


console.log(
    "Attempting to load GLB:"
);


console.log(
    resolvedModelURL.href
);


console.log(
    "======================================"
);



// ============================================================
// LOAD MODEL
// ============================================================

loader.load(

    modelPath,



    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    function (gltf) {


        console.log(
            "GLB loaded successfully!"
        );


        const model =
            gltf.scene;


        scene.add(
            model
        );



        // ----------------------------------------------------
        // GET MODEL BOUNDS
        // ----------------------------------------------------

        const box =
            new THREE.Box3()
                .setFromObject(
                    model
                );


        const size =
            box.getSize(

                new THREE.Vector3()

            );


        const center =
            box.getCenter(

                new THREE.Vector3()

            );



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

        model.position.x -=
            center.x;


        model.position.y -=
            center.y;


        model.position.z -=
            center.z;



        // ----------------------------------------------------
        // FIND LARGEST MODEL DIMENSION
        // ----------------------------------------------------

        const maxDimension =
            Math.max(

                size.x,

                size.y,

                size.z

            );



        // ----------------------------------------------------
        // AUTO-FIT DESKTOP CAMERA
        // ----------------------------------------------------

        const cameraDistance =
            maxDimension * 1.5;


        camera.position.set(

            cameraDistance,

            cameraDistance * 0.75,

            cameraDistance

        );



        // ----------------------------------------------------
        // CENTER ORBIT CONTROLS
        // ----------------------------------------------------

        controls.target.set(

            0,

            0,

            0

        );


        controls.update();


        console.log(
            "Camera position:",
            camera.position
        );

    },



    // --------------------------------------------------------
    // PROGRESS
    // --------------------------------------------------------

    function (xhr) {


        if (
            xhr.total > 0
        ) {


            const percent =
                (
                    xhr.loaded /
                    xhr.total
                ) * 100;


            console.log(

                "Model loading:",

                percent.toFixed(1)
                + "%"

            );

        }

    },



    // --------------------------------------------------------
    // ERROR
    // --------------------------------------------------------

    function (error) {


        console.error(
            "======================================"
        );


        console.error(
            "GLB LOADING ERROR"
        );


        console.error(
            "Attempted URL:"
        );


        console.error(
            resolvedModelURL.href
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
// UI ELEMENTS
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
// CURRENT MODE
// ============================================================

let currentMode =
    "desktop";



// ============================================================
// CREATE THREE.JS VR BUTTON
// ============================================================

const vrButton =
    VRButton.createButton(
        renderer
    );


vrButtonContainer.appendChild(
    vrButton
);



// ============================================================
// STYLE VR BUTTON
// ============================================================

vrButton.style.position =
    "relative";


vrButton.style.left =
    "auto";


vrButton.style.right =
    "auto";


vrButton.style.bottom =
    "auto";


vrButton.style.width =
    "auto";


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


        currentMode =
            "desktop";


        console.log(
            "Desktop mode selected."
        );



        // UI

        desktopButton
            .classList
            .add(
                "active"
            );


        questButton
            .classList
            .remove(
                "active"
            );



        // Hide WebXR button

        vrButtonContainer
            .style
            .display =
            "none";



        // Enable mouse controls

        controls.enabled =
            true;

    }

);



// ============================================================
// META QUEST MODE
// ============================================================

questButton.addEventListener(

    "click",

    function () {


        currentMode =
            "quest";


        console.log(
            "Meta Quest mode selected."
        );



        // UI

        questButton
            .classList
            .add(
                "active"
            );


        desktopButton
            .classList
            .remove(
                "active"
            );



        // Show WebXR button

        vrButtonContainer
            .style
            .display =
            "block";



        // Disable mouse controls

        controls.enabled =
            false;

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
// CHECK IMMERSIVE VR SUPPORT
// ============================================================

if (
    navigator.xr
) {


    navigator.xr
        .isSessionSupported(
            "immersive-vr"
        )


        .then(

            function (
                supported
            ) {


                console.log(

                    "Immersive VR supported:",

                    supported

                );


                if (
                    supported
                ) {


                    console.log(
                        "WebXR is ready for VR."
                    );

                }


                else {


                    console.warn(
                        "Immersive VR is not supported in this browser."
                    );

                }

            }

        )


        .catch(

            function (
                error
            ) {


                console.error(

                    "WebXR support check failed:",

                    error

                );

            }

        );

}


else {


    console.warn(
        "navigator.xr is unavailable."
    );


    console.warn(
        "WebXR is not available in this browser/context."
    );

}



// ============================================================
// WEBXR SESSION EVENTS
// ============================================================

renderer.xr.addEventListener(

    "sessionstart",

    function () {


        console.log(
            "WebXR session started."
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
// RENDER LOOP
// ============================================================

function animate() {


    // OrbitControls should only update
    // in desktop mode.

    if (
        currentMode ===
        "desktop"
    ) {


        controls.update();

    }


    renderer.render(

        scene,

        camera

    );

}



// ============================================================
// START WEBXR-COMPATIBLE RENDER LOOP
// ============================================================

renderer.setAnimationLoop(
    animate
);