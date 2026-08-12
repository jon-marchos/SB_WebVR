// ============================================================
// SB WEBVR
// GLB VIEWER + META QUEST WEBXR CONTROLS
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


import {
    XRControllerModelFactory
}
from "three/addons/webxr/XRControllerModelFactory.js";



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
// VR PLAYER RIG
// ============================================================
//
// We move this group in VR instead of moving the camera.
//
// scene
//   └── player
//         └── camera
//
// The headset still controls the camera's local pose.
// ============================================================

const player =
    new THREE.Group();


scene.add(
    player
);


player.add(
    camera
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


renderer.xr.enabled =
    true;


document.body.appendChild(
    renderer.domElement
);



// ============================================================
// DESKTOP CONTROLS
// ============================================================

const controls =
    new OrbitControls(

        camera,
        renderer.domElement

    );


controls.enableDamping =
    true;


controls.dampingFactor =
    0.05;



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
// XR CONTROLLERS
// ============================================================

const controller1 =
    renderer.xr.getController(
        0
    );


const controller2 =
    renderer.xr.getController(
        1
    );


player.add(
    controller1
);


player.add(
    controller2
);



// ============================================================
// XR CONTROLLER MODELS
// ============================================================

const controllerModelFactory =
    new XRControllerModelFactory();



// ------------------------------------------------------------
// LEFT / FIRST CONTROLLER GRIP
// ------------------------------------------------------------

const controllerGrip1 =
    renderer.xr.getControllerGrip(
        0
    );


controllerGrip1.add(

    controllerModelFactory
        .createControllerModel(
            controllerGrip1
        )

);


player.add(
    controllerGrip1
);



// ------------------------------------------------------------
// RIGHT / SECOND CONTROLLER GRIP
// ------------------------------------------------------------

const controllerGrip2 =
    renderer.xr.getControllerGrip(
        1
    );


controllerGrip2.add(

    controllerModelFactory
        .createControllerModel(
            controllerGrip2
        )

);


player.add(
    controllerGrip2
);



// ============================================================
// VR MOVEMENT SETTINGS
// ============================================================

const moveSpeed =
    3.0;


// vertical movement speed

const verticalSpeed =
    2.0;


// joystick deadzone

const deadzone =
    0.15;



// ============================================================
// CLOCK
// ============================================================
//
// Makes movement independent of headset refresh rate.
// ============================================================

const clock =
    new THREE.Clock();



// ============================================================
// GLTF LOADER
// ============================================================

const loader =
    new GLTFLoader();



// ============================================================
// MODEL STATE
// ============================================================

let currentModel =
    null;


let currentObjectURL =
    null;



// ============================================================
// UI
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
// CURRENT MODE
// ============================================================

let currentMode =
    "desktop";



// ============================================================
// UPLOAD BUTTON
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

    function (
        event
    ) {


        const file =
            event.target.files[0];


        if (!file) {

            return;

        }



        // ----------------------------------------------------
        // CHECK EXTENSION
        // ----------------------------------------------------

        if (

            !file.name
                .toLowerCase()
                .endsWith(
                    ".glb"
                )

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
            ).toFixed(
                2
            ),

            "MB"

        );



        // ----------------------------------------------------
        // UI
        // ----------------------------------------------------

        fileName.textContent =
            file.name;


        fileName.style.display =
            "block";


        startMessage.style.display =
            "none";



        // ----------------------------------------------------
        // REMOVE PREVIOUS MODEL
        // ----------------------------------------------------

        removeCurrentModel();



        // ----------------------------------------------------
        // REMOVE OLD OBJECT URL
        // ----------------------------------------------------

        if (
            currentObjectURL
        ) {


            URL.revokeObjectURL(
                currentObjectURL
            );


        }



        // ----------------------------------------------------
        // CREATE URL FROM LOCAL GLB
        // ----------------------------------------------------

        currentObjectURL =
            URL.createObjectURL(
                file
            );



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

        function (
            gltf
        ) {


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
            // RESET PLAYER
            // ------------------------------------------------

            player.position.set(
                0,
                0,
                0
            );


            player.rotation.set(
                0,
                0,
                0
            );



            // ------------------------------------------------
            // DESKTOP CAMERA
            // ------------------------------------------------

            fitCameraToModel(
                size
            );

        },



        // ----------------------------------------------------
        // PROGRESS
        // ----------------------------------------------------

        function (
            xhr
        ) {


            if (
                xhr.total >
                0
            ) {


                const percent =

                    (
                        xhr.loaded /
                        xhr.total
                    )

                    * 100;


                console.log(

                    "Loading:",

                    percent.toFixed(
                        1
                    )

                    + "%"

                );


            }

        },



        // ----------------------------------------------------
        // ERROR
        // ----------------------------------------------------

        function (
            error
        ) {


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
// FIT DESKTOP CAMERA
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
    // CLIPPING
    // --------------------------------------------------------

    camera.near =
        Math.max(

            maxDimension /
            100000,

            0.001

        );


    camera.far =
        Math.max(

            maxDimension *
            100,

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
                fieldOfView /
                2
            )
        );


    cameraDistance *=
        1.4;



    camera.position.set(

        cameraDistance,

        cameraDistance *
        0.6,

        cameraDistance

    );


    controls.target.set(

        0,

        0,

        0

    );


    controls.update();

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



    currentModel.traverse(

        function (
            child
        ) {


            // ------------------------------------------------
            // GEOMETRY
            // ------------------------------------------------

            if (
                child.geometry
            ) {


                child.geometry.dispose();


            }



            // ------------------------------------------------
            // MATERIAL
            // ------------------------------------------------

            if (
                child.material
            ) {


                const materials =

                    Array.isArray(
                        child.material
                    )

                        ? child.material

                        : [
                            child.material
                        ];



                materials.forEach(

                    function (
                        material
                    ) {


                        // ------------------------------------
                        // TEXTURES
                        // ------------------------------------

                        for (
                            const key
                            in material
                        ) {


                            const value =
                                material[
                                    key
                                ];


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

    }

);



// ============================================================
// VR MOVEMENT
// ============================================================

function updateVRMovement(delta) {

    if (!renderer.xr.isPresenting) {
        return;
    }

    const session = renderer.xr.getSession();

    if (!session) {
        return;
    }

    for (const inputSource of session.inputSources) {

        const gamepad = inputSource.gamepad;

        if (!gamepad) {
            continue;
        }

        const axes = gamepad.axes;

        let x = 0;
        let y = 0;

        // ----------------------------------------------------
        // QUEST / WEBXR AXIS DETECTION
        // ----------------------------------------------------

        if (axes.length >= 4) {

            // Most Quest Touch / WebXR layouts
            x = axes[2];
            y = axes[3];

        }

        else if (axes.length >= 2) {

            // Some runtimes expose only the thumbstick pair
            x = axes[0];
            y = axes[1];

        }

        // ----------------------------------------------------
        // DEADZONE
        // ----------------------------------------------------

        if (Math.abs(x) < deadzone) {
            x = 0;
        }

        if (Math.abs(y) < deadzone) {
            y = 0;
        }

        // ----------------------------------------------------
        // DEBUG
        // ----------------------------------------------------

        if (x !== 0 || y !== 0) {

            console.log(
                inputSource.handedness,
                "x:",
                x.toFixed(2),
                "y:",
                y.toFixed(2),
                "axes:",
                axes
            );

        }

        // ----------------------------------------------------
        // LEFT STICK
        // ----------------------------------------------------

        if (inputSource.handedness === "left") {

            moveHorizontal(
                x,
                y,
                delta
            );

        }

        // ----------------------------------------------------
        // RIGHT STICK
        // ----------------------------------------------------

        if (inputSource.handedness === "right") {

            moveVertical(
                y,
                delta
            );

        }

    }

}


// ============================================================
// HORIZONTAL VR MOVEMENT
// ============================================================

function moveHorizontal(

    x,

    y,

    delta

) {


    // --------------------------------------------------------
    // HEADSET FACING DIRECTION
    // --------------------------------------------------------

    const forward =
        new THREE.Vector3();


const xrCamera =
    renderer.xr.getCamera(camera);

xrCamera.getWorldDirection(
    forward
);


    // Ignore headset pitch.
    //
    // Looking upward should not make the player fly upward.

    forward.y =
        0;


    if (
        forward.lengthSq() <
        0.000001
    ) {

        return;

    }


    forward.normalize();



    // --------------------------------------------------------
    // RIGHT VECTOR
    // --------------------------------------------------------

    const right =
        new THREE.Vector3();


    right.crossVectors(

        forward,

        new THREE.Vector3(
            0,
            1,
            0
        )

    );


    right.normalize();


    // --------------------------------------------------------
    // FORWARD / BACKWARD
    // --------------------------------------------------------

    const forwardMove =

        forward.clone()
            .multiplyScalar(

                -y *

                moveSpeed *

                delta

            );



    // --------------------------------------------------------
    // STRAFE
    // --------------------------------------------------------

    const strafeMove =

        right.clone()
            .multiplyScalar(

                x *

                moveSpeed *

                delta

            );



    // --------------------------------------------------------
    // APPLY MOVEMENT
    // --------------------------------------------------------

    player.position.add(
        forwardMove
    );


    player.position.add(
        strafeMove
    );

}



// ============================================================
// VERTICAL VR MOVEMENT
// ============================================================

function moveVertical(

    y,

    delta

) {


    player.position.y +=

        -y *

        verticalSpeed *

        delta;

}



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
                "XR support error:",
                error
            );


        }

    }

}


checkXR();



// ============================================================
// XR SESSION EVENTS
// ============================================================

renderer.xr.addEventListener(

    "sessionstart",

    function () {

        console.log("VR session started.");

        // Reset player transform

        player.position.set(
            0,
            0,
            0
        );

        player.rotation.set(
            0,
            0,
            0
        );

        // WebXR will control the headset pose.
        // Reset desktop camera offset.

        camera.position.set(
            0,
            0,
            0
        );

        camera.rotation.set(
            0,
            0,
            0
        );

        clock.getDelta();

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
// ANIMATION LOOP
// ============================================================

function animate() {


    const delta =
        Math.min(

            clock.getDelta(),

            0.1

        );



    // --------------------------------------------------------
    // VR
    // --------------------------------------------------------

    if (
        renderer.xr.isPresenting
    ) {


        updateVRMovement(
            delta
        );


    }



    // --------------------------------------------------------
    // DESKTOP
    // --------------------------------------------------------

    else if (

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
// START
// ============================================================

renderer.setAnimationLoop(
    animate
);