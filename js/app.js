import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory.js";

// ============================================================
// SCENE / CAMERA / RENDERER
// ============================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    100000
);
camera.position.set(5, 5, 5);

const player = new THREE.Group();
scene.add(player);
player.add(camera);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// ============================================================
// DESKTOP CONTROLS
// ============================================================

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// ============================================================
// LIGHTING
// ============================================================

scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// ============================================================
// XR CONTROLLERS
// ============================================================

const controller1 = renderer.xr.getController(0);
const controller2 = renderer.xr.getController(1);

player.add(controller1);
player.add(controller2);

const controllerModelFactory = new XRControllerModelFactory();

const controllerGrip1 = renderer.xr.getControllerGrip(0);
controllerGrip1.add(
    controllerModelFactory.createControllerModel(controllerGrip1)
);
player.add(controllerGrip1);

const controllerGrip2 = renderer.xr.getControllerGrip(1);
controllerGrip2.add(
    controllerModelFactory.createControllerModel(controllerGrip2)
);
player.add(controllerGrip2);

// ============================================================
// LEFT CONTROLLER TRACKING
// ============================================================

let leftController = null;
let leftTriggerHeld = false;
let previousControllerYaw = 0;

controller1.addEventListener("connected", (event) => {
    if (event.data.handedness === "left") leftController = controller1;
});

controller2.addEventListener("connected", (event) => {
    if (event.data.handedness === "left") leftController = controller2;
});

controller1.addEventListener("disconnected", () => {
    if (leftController === controller1) leftController = null;
});

controller2.addEventListener("disconnected", () => {
    if (leftController === controller2) leftController = null;
});

// ============================================================
// MOVEMENT SETTINGS
// ============================================================

const moveSpeed = 3.0;
const verticalSpeed = 2.0;
const deadzone = 0.15;
const rotationSensitivity = 1.0;

const clock = new THREE.Clock();

// ============================================================
// LEFT TRIGGER ROTATION
// ============================================================

function setupTriggerRotation(controller) {
    controller.addEventListener("selectstart", () => {
        if (controller !== leftController) return;

        leftTriggerHeld = true;
        previousControllerYaw = getControllerYaw(controller);
    });

    controller.addEventListener("selectend", () => {
        if (controller !== leftController) return;

        leftTriggerHeld = false;
    });
}

setupTriggerRotation(controller1);
setupTriggerRotation(controller2);

function getControllerYaw(controller) {
    const quaternion = new THREE.Quaternion();
    controller.getWorldQuaternion(quaternion);

    const euler = new THREE.Euler(0, 0, 0, "YXZ");
    euler.setFromQuaternion(quaternion);

    return euler.y;
}

function updateTriggerRotation() {
    if (!renderer.xr.isPresenting || !leftTriggerHeld || !leftController) return;

    const currentYaw = getControllerYaw(leftController);
    let deltaYaw = currentYaw - previousControllerYaw;

    if (deltaYaw > Math.PI) deltaYaw -= Math.PI * 2;
    if (deltaYaw < -Math.PI) deltaYaw += Math.PI * 2;

    player.rotation.y -= deltaYaw * rotationSensitivity;
    previousControllerYaw = currentYaw;
}

// ============================================================
// GLB LOADING
// ============================================================

const loader = new GLTFLoader();
let currentModel = null;
let currentObjectURL = null;

// ============================================================
// UI
// ============================================================

const uploadButton = document.getElementById("upload-button");
const fileInput = document.getElementById("file-input");
const fileName = document.getElementById("file-name");
const startMessage = document.getElementById("start-message");
const desktopButton = document.getElementById("desktop-button");
const questButton = document.getElementById("quest-button");
const vrButtonContainer = document.getElementById("vr-button-container");

let currentMode = "desktop";

// ============================================================
// UPLOAD GLB
// ============================================================

uploadButton.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".glb")) {
        alert("Please select a .glb file.");
        return;
    }

    fileName.textContent = file.name;
    fileName.style.display = "block";
    startMessage.style.display = "none";

    removeCurrentModel();

    if (currentObjectURL) {
        URL.revokeObjectURL(currentObjectURL);
    }

    currentObjectURL = URL.createObjectURL(file);
    loadModel(currentObjectURL);
});

// ============================================================
// LOAD MODEL
// ============================================================

function loadModel(url) {
    loader.load(
        url,
        (gltf) => {
            currentModel = gltf.scene;
            scene.add(currentModel);

            const box = new THREE.Box3().setFromObject(currentModel);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            currentModel.position.x -= center.x;
            currentModel.position.y -= center.y;
            currentModel.position.z -= center.z;

            player.position.set(0, 0, 0);
            player.rotation.set(0, 0, 0);

            fitCameraToModel(size);

            console.log("GLB loaded.");
            console.log("Model dimensions:", size);
        },
        (xhr) => {
            if (xhr.total > 0) {
                console.log(
                    ((xhr.loaded / xhr.total) * 100).toFixed(1) + "% loaded"
                );
            }
        },
        (error) => {
            console.error("GLB loading error:", error);

            startMessage.innerHTML =
                "<strong>MODEL FAILED TO LOAD</strong><br><br>Check the browser console.";

            startMessage.style.display = "block";
        }
    );
}

// ============================================================
// CAMERA FIT
// ============================================================

function fitCameraToModel(size) {
    const maxDimension = Math.max(size.x, size.y, size.z);

    camera.near = Math.max(maxDimension / 100000, 0.001);
    camera.far = Math.max(maxDimension * 100, 1000);
    camera.updateProjectionMatrix();

    const fov = THREE.MathUtils.degToRad(camera.fov);
    let cameraDistance =
        maxDimension / (2 * Math.tan(fov / 2));

    cameraDistance *= 1.4;

    camera.position.set(
        cameraDistance,
        cameraDistance * 0.6,
        cameraDistance
    );

    controls.target.set(0, 0, 0);
    controls.update();
}

// ============================================================
// REMOVE OLD MODEL
// ============================================================

function removeCurrentModel() {
    if (!currentModel) return;

    scene.remove(currentModel);

    currentModel.traverse((child) => {
        if (child.geometry) {
            child.geometry.dispose();
        }

        if (child.material) {
            const materials = Array.isArray(child.material)
                ? child.material
                : [child.material];

            materials.forEach((material) => {
                for (const key in material) {
                    const value = material[key];
                    if (value && value.isTexture) value.dispose();
                }

                material.dispose();
            });
        }
    });

    currentModel = null;
}

// ============================================================
// VR BUTTON
// ============================================================

const vrButton = VRButton.createButton(renderer);
vrButtonContainer.appendChild(vrButton);

vrButton.style.position = "relative";
vrButton.style.left = "auto";
vrButton.style.right = "auto";
vrButton.style.bottom = "auto";
vrButton.style.width = "auto";
vrButton.style.fontFamily = "Helvetica, Arial, sans-serif";
vrButton.style.fontSize = "11px";
vrButton.style.fontWeight = "500";
vrButton.style.letterSpacing = "0.7px";
vrButton.style.padding = "10px 18px";
vrButton.style.borderRadius = "8px";
vrButton.style.background = "rgba(25,25,25,0.65)";
vrButton.style.color = "white";
vrButton.style.border = "1px solid rgba(255,255,255,0.15)";

// ============================================================
// DESKTOP / QUEST MODE
// ============================================================

desktopButton.addEventListener("click", () => {
    currentMode = "desktop";

    desktopButton.classList.add("active");
    questButton.classList.remove("active");

    vrButtonContainer.style.display = "none";
    controls.enabled = true;
});

questButton.addEventListener("click", () => {
    currentMode = "quest";

    questButton.classList.add("active");
    desktopButton.classList.remove("active");

    vrButtonContainer.style.display = "block";
    controls.enabled = false;
});

// ============================================================
// VR MOVEMENT
// ============================================================

function updateVRMovement(delta) {
    if (!renderer.xr.isPresenting) return;

    const session = renderer.xr.getSession();
    if (!session) return;

    for (const inputSource of session.inputSources) {
        const gamepad = inputSource.gamepad;
        if (!gamepad) continue;

        const axes = gamepad.axes;

        let x = 0;
        let y = 0;

        if (axes.length >= 4) {
            x = axes[2] ?? 0;
            y = axes[3] ?? 0;
        } else if (axes.length >= 2) {
            x = axes[0] ?? 0;
            y = axes[1] ?? 0;
        }

        if (Math.abs(x) < deadzone) x = 0;
        if (Math.abs(y) < deadzone) y = 0;

        if (inputSource.handedness === "left") {
            moveHorizontal(x, y, delta);
        }

        if (inputSource.handedness === "right") {
            moveVertical(y, delta);
        }
    }
}

// ============================================================
// HORIZONTAL MOVEMENT
// ============================================================

function moveHorizontal(x, y, delta) {
    const xrCamera = renderer.xr.getCamera(camera);

    const forward = new THREE.Vector3();
    xrCamera.getWorldDirection(forward);

    forward.y = 0;

    if (forward.lengthSq() < 0.000001) return;

    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(
        forward,
        new THREE.Vector3(0, 1, 0)
    );
    right.normalize();

    const forwardMove = forward
        .clone()
        .multiplyScalar(-y * moveSpeed * delta);

    const strafeMove = right
        .clone()
        .multiplyScalar(x * moveSpeed * delta);

    player.position.add(forwardMove);
    player.position.add(strafeMove);
}

// ============================================================
// VERTICAL MOVEMENT
// ============================================================

function moveVertical(y, delta) {
    player.position.y +=
        -y * verticalSpeed * delta;
}

// ============================================================
// XR SESSION
// ============================================================

renderer.xr.addEventListener("sessionstart", () => {
    console.log("VR session started.");

    player.position.set(0, 0, 0);
    player.rotation.set(0, 0, 0);

    camera.position.set(0, 0, 0);
    camera.rotation.set(0, 0, 0);

    clock.getDelta();
});

renderer.xr.addEventListener("sessionend", () => {
    console.log("VR session ended.");

    leftTriggerHeld = false;
});

// ============================================================
// WEBXR DEBUG
// ============================================================

async function checkXR() {
    console.log("HTTPS:", window.isSecureContext);
    console.log("navigator.xr:", Boolean(navigator.xr));

    if (!navigator.xr) return;

    try {
        const supported =
            await navigator.xr.isSessionSupported("immersive-vr");

        console.log("immersive-vr:", supported);
    } catch (error) {
        console.error("XR support error:", error);
    }
}

checkXR();

// ============================================================
// RESIZE
// ============================================================

window.addEventListener("resize", () => {
    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});

// ============================================================
// LOOP
// ============================================================

function animate() {
    const delta = Math.min(clock.getDelta(), 0.1);

    if (renderer.xr.isPresenting) {
        updateVRMovement(delta);
        updateTriggerRotation();
    } else if (currentMode === "desktop") {
        controls.update();
    }

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);