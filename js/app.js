// ============================================================
// SB WEBVR
// LOCAL GLB VIEWER + WEBXR
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

        0.01,

        100000

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


renderer.xr.enabled = true;


document.body.appendChild(
    renderer.domElement
);



// ============================================================
// ORBIT CONTROLS
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



// ============================================================
// GLTF LOADER
// ============================================================

const loader =
    new GLTFLoader();



// ============================================================
// MODEL VARIABLES
// ============================================================

let currentModel = null;

let currentObjectURL = null;



// ============================================================
// UI ELEMENTS
// ============================================================

const uploadButton =
    document.getElementById(
        "upload-button"
    );


const fileInput =
    document.getElementById(
        "file-input"
    );


const fileName =
    document.getElementById(
        "file-name"
    );


const startMessage =
    document.getElementById(
        "start-message"
    );


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
// OPEN FILE BROWSER
// ============================================================

uploadButton.addEventListener(

    "click",

    function () {

        fileInput.click();

    }

);



// ============================================================
// FILE SELECTED
// ============================================================

fileInput.addEventListener(

    "change",

    function (event) {


        const file =
            event.target.files[0];


        if (!file) {

            return;

        }



        // ----------------------------------------------------
        // MAKE SURE IT IS A GLB
        // ----------------------------------------------------

        if (
            !file.name
                .toLowerCase()
                .endsWith(".glb")
        ) {

            alert(
                "Please select a .glb file."
            );

            return;

        }



        console.log(
            "Selected GLB:",
            file.name
        );


        console.log(
            "File size:",
            (
                file.size /
                1024 /
                1024
            ).toFixed(2),
            "MB"
        );



        // ----------------------------------------------------
        // SHOW FILE NAME
        // ----------------------------------------------------

        fileName.textContent =
            file.name;


        fileName.style.display =
            "block";



        // ----------------------------------------------------
        // REMOVE START MESSAGE
        // ----------------------------------------------------

        startMessage.style.display =
            "none";



        // ----------------------------------------------------
        // REMOVE OLD MODEL
        // ----------------------------------------------------

        removeCurrentModel();



        // ----------------------------------------------------
        // REMOVE PREVIOUS TEMPORARY URL
        // ----------------------------------------------------

        if (
            currentObjectURL
        ) {


            URL.revokeObjectURL(
                currentObjectURL
            );


        }



        // ----------------------------------------------------
        // CREATE TEMPORARY LOCAL URL
        // ----------------------------------------------------

        currentObjectURL =
            URL.createObjectURL(
                file
            );



        console.log(
            "Temporary model URL:",
            currentObjectURL
        );



        // ----------------------------------------------------
        // LOAD MODEL
        // ----------------------------------------------------

        loadModel(
            currentObjectURL
        );

    }

);



// ============================================================
// LOAD MODEL
// ============================================================

function loadModel(
    url
) {


    loader.load(


        url,



        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        function (gltf) {


            console.log(
                "GLB loaded successfully."
            );


            currentModel =
                gltf.scene;


            scene.add(
                currentModel
            );



            // ------------------------------------------------
            // MODEL BOUNDS
            // ------------------------------------------------

            const box =
                new THREE.Box3()
                    .setFromObject(
                        currentModel
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
                "Model dimensions:",
                size
            );


            console.log(
                "Model center:",
                center
            );



            // ------------------------------------------------
            // CENTER MODEL
            // ------------------------------------------------

            currentModel.position.x -=
                center.x;


            currentModel.position.y -=
                center.y;


            currentModel.position.z -=
                center.z;



            // ------------------------------------------------
            // AUTO-FIT CAMERA
            // ------------------------------------------------

            fitCameraToModel(
                size
            );

        },



        // ----------------------------------------------------
        // LOADING PROGRESS
        // ----------------------------------------------------

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

                    percent.toFixed(1)
                    + "% loaded"

                );

            }

        },



        // ----------------------------------------------------
        // ERROR
        // ----------------------------------------------------

        function (error) {


            console.error(
                "GLB loading error:",
                error
            );


            startMessage.innerHTML =

                "<strong>MODEL FAILED TO LOAD</strong>" +

                "<br><br>" +

                "Check the browser console.";


            startMessage.style.display =
                "block";

        }


    );

}



// ============================================================
// FIT CAMERA TO MODEL
// ============================================================

function fitCameraToModel(
    size
) {


    const maxDimension =
        Math.max(

            size.x,

            size.y,

            size.z

        );



    // --------------------------------------------------------
    // CAMERA CLIPPING
    // --------------------------------------------------------

    camera.near =
        Math.max(
            maxDimension / 100000,
            0.001
        );


    camera.far =
        Math.max(
            maxDimension * 100,
            1000
        );


    camera.updateProjectionMatrix();



    // --------------------------------------------------------
    // CAMERA DISTANCE
    // --------------------------------------------------------

    const fieldOfView =
        THREE.MathUtils.degToRad(
            camera.fov
        );


    let cameraDistance =

        maxDimension /

        (
            2 *
            Math.tan(
                fieldOfView / 2
            )
        );



    cameraDistance *=
        1.4;



    camera.position.set(

        cameraDistance,

        cameraDistance * 0.6,

        cameraDistance

    );



    controls.target.set(

        0,

        0,

        0

    );


    controls.update();



    console.log(
        "Camera fitted to model."
    );

}



// ============================================================
// REMOVE CURRENT MODEL
// ============================================================

function removeCurrentModel() {


    if (
        !currentModel
    ) {

        return;

    }



    scene.remove(
        currentModel
    );



    // --------------------------------------------------------
    // CLEAN UP GPU MEMORY
    // --------------------------------------------------------

    currentModel.traverse(

        function (child) {


            if (
                child.geometry
            ) {


                child.geometry.dispose();


            }



            if (
                child.material
            ) {


                const materials =
                    Array.isArray(
                        child.material
                    )
                        ?
                        child.material
                        :
                        [child.material];



                materials.forEach(

                    function (material) {


                        // Dispose textures

                        for (
                            const key
                            in material
                        ) {


                            const value =
                                material[key];


                            if (
                                value &&
                                value.isTexture
                            ) {


                                value.dispose();


                            }

                        }



                        material.dispose();

                    }

                );

            }

        }

    );



    currentModel =
        null;


    console.log(
        "Previous model removed."
    );

}



// ============================================================
// VR BUTTON
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
    "rgba(25,25,25,0.65)";


vrButton.style.color =
    "white";


vrButton.style.border =
    "1px solid rgba(255,255,255,0.15)";



// ============================================================
// CURRENT MODE
// ============================================================

let currentMode =
    "desktop";



// ============================================================
// DESKTOP MODE
// ============================================================

desktopButton.addEventListener(

    "click",

    function () {


        currentMode =
            "desktop";


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


        vrButtonContainer.style.display =
            "none";


        controls.enabled =
            true;


        console.log(
            "Desktop mode."
        );

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


        vrButtonContainer.style.display =
            "block";


        controls.enabled =
            false;


        console.log(
            "Meta Quest mode."
        );

    }

);



// ============================================================
// WEBXR DEBUG
// ============================================================

async function checkXR() {


    console.log(
        "HTTPS:",
        window.isSecureContext
    );


    console.log(
        "navigator.xr:",
        Boolean(
            navigator.xr
        )
    );



    if (
        navigator.xr
    ) {


        try {


            const supported =

                await navigator.xr
                    .isSessionSupported(
                        "immersive-vr"
                    );


            console.log(
                "immersive-vr:",
                supported
            );


        }


        catch (
            error
        ) {


            console.error(
                "XR error:",
                error
            );


        }

    }

}


checkXR();



// ============================================================
// WEBXR SESSION EVENTS
// ============================================================

renderer.xr.addEventListener(

    "sessionstart",

    function () {


        console.log(
            "VR session started."
        );

    }

);



renderer.xr.addEventListener(

    "sessionend",

    function () {


        console.log(
            "VR session ended."
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
// START RENDER LOOP
// ============================================================

renderer.setAnimationLoop(
    animate
);