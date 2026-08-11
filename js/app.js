import * as THREE from 'three';

import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';

import {
    GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';

import {
    VRButton
} from 'three/addons/webxr/VRButton.js';



// ----------------------------------------------------
// SCENE
// ----------------------------------------------------

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x111111);



// ----------------------------------------------------
// CAMERA
// ----------------------------------------------------

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



// ----------------------------------------------------
// RENDERER
// ----------------------------------------------------

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


// Enable WebXR

renderer.xr.enabled = true;


// Add renderer to page

document.body.appendChild(
    renderer.domElement
);



// ----------------------------------------------------
// DESKTOP CONTROLS
// ----------------------------------------------------

const controls =
    new OrbitControls(

        camera,
        renderer.domElement

    );


controls.enableDamping = true;

controls.dampingFactor = 0.05;



// ----------------------------------------------------
// LIGHTING
// ----------------------------------------------------

const ambientLight =
    new THREE.AmbientLight(

        0xffffff,
        1.5

    );


scene.add(
    ambientLight
);



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



// ----------------------------------------------------
// GLTF / GLB LOADER
// ----------------------------------------------------

const loader =
    new GLTFLoader();



// ----------------------------------------------------
// IMPORTANT GITHUB PAGES PATH FIX
// ----------------------------------------------------

// app.js lives in:
//
// /SB_WEBVR/js/app.js
//
// So:
//
// ../models/12_3_2024.glb
//
// becomes:
//
// /SB_WEBVR/models/12_3_2024.glb
//
// automatically.
//
// This works both:
//
// localhost
//
// AND
//
// GitHub Pages
//

const modelURL =
    new URL(

        "../models/12_3_2024.glb",

        import.meta.url

    );



// ----------------------------------------------------
// DEBUG MODEL URL
// ----------------------------------------------------

console.log(
    "Trying to load model:"
);

console.log(
    modelURL.href
);



// ----------------------------------------------------
// LOAD MODEL
// ----------------------------------------------------

loader.load(

    modelURL.href,


    // --------------------------------
    // MODEL LOADED
    // --------------------------------

    function (gltf) {


        const model =
            gltf.scene;


        scene.add(
            model
        );


        console.log(
            "GLB loaded successfully!"
        );


        console.log(
            model
        );



        // --------------------------------
        // GET MODEL BOUNDS
        // --------------------------------

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



        // --------------------------------
        // CENTER MODEL
        // --------------------------------

        model.position.x -=
            center.x;


        model.position.y -=
            center.y;


        model.position.z -=
            center.z;



        // --------------------------------
        // FIND MAXIMUM MODEL DIMENSION
        // --------------------------------

        const maxDimension =
            Math.max(

                size.x,

                size.y,

                size.z

            );



        // --------------------------------
        // AUTO CAMERA DISTANCE
        // --------------------------------

        const cameraDistance =
            maxDimension * 1.5;



        camera.position.set(

            cameraDistance,

            cameraDistance * 0.75,

            cameraDistance

        );



        // --------------------------------
        // CENTER ORBIT CONTROLS
        // --------------------------------

        controls.target.set(

            0,
            0,
            0

        );


        controls.update();

    },


    // --------------------------------
    // MODEL LOADING PROGRESS
    // --------------------------------

    function (xhr) {


        if (xhr.total) {

            const percent =
                xhr.loaded /
                xhr.total *
                100;


            console.log(

                percent.toFixed(1) +
                "% loaded"

            );

        }

    },


    // --------------------------------
    // ERROR
    // --------------------------------

    function (error) {


        console.error(
            "GLB loading error:"
        );


        console.error(
            error
        );

    }

);



// ----------------------------------------------------
// MODE SWITCH UI
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



let currentMode =
    "desktop";



// ----------------------------------------------------
// CREATE THREE.JS VR BUTTON
// ----------------------------------------------------

const vrButton =
    VRButton.createButton(
        renderer
    );


vrButtonContainer.appendChild(
    vrButton
);



// ----------------------------------------------------
// OVERRIDE DEFAULT VR BUTTON STYLING
// ----------------------------------------------------

vrButton.style.position =
    "relative";


vrButton.style.left =
    "auto";


vrButton.style.right =
    "auto";


vrButton.style.bottom =
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


vrButton.style.backdropFilter =
    "blur(10px)";


vrButton.style.border =
    "1px solid rgba(255,255,255,0.15)";


vrButton.style.color =
    "white";



// ----------------------------------------------------
// DESKTOP MODE
// ----------------------------------------------------

desktopButton.addEventListener(

    "click",

    () => {


        currentMode =
            "desktop";


        desktopButton
            .classList
            .add("active");


        questButton
            .classList
            .remove("active");


        vrButtonContainer.style.display =
            "none";


        controls.enabled =
            true;

    }

);



// ----------------------------------------------------
// META QUEST MODE
// ----------------------------------------------------

questButton.addEventListener(

    "click",

    () => {


        currentMode =
            "quest";


        questButton
            .classList
            .add("active");


        desktopButton
            .classList
            .remove("active");


        vrButtonContainer.style.display =
            "block";


        controls.enabled =
            false;

    }

);



// ----------------------------------------------------
// DEBUG WEBXR SUPPORT
// ----------------------------------------------------

console.log(
    "Secure context:",
    window.isSecureContext
);


console.log(
    "navigator.xr:",
    navigator.xr
);


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

            }

        )
        .catch(

            function (error) {


                console.error(
                    "WebXR support check error:",
                    error
                );

            }

        );

}



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



// IMPORTANT:
// WebXR should use setAnimationLoop()
// instead of requestAnimationFrame()

renderer.setAnimationLoop(
    animate
);