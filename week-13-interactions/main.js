import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd4f0ff);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.set(0, 2, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

const cubes = [];
const cubeInfoEl = document.getElementById('cube-info');
const defaultInfoText = 'Click a cube to see its information here.';

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selectedCube = null;

const randomRange = (min, max) => Math.random() * (max - min) + min;

function spawnCubes(count = 20) {
    for (let i = 0; i < count; i++) {
        const width = randomRange(0.5, 1.5);
        const height = randomRange(0.5, 1.5);
        const depth = randomRange(0.5, 1.5);
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const color = new THREE.Color().setHSL(Math.random(), 0.55 + Math.random() * 0.3, 0.55);
        const material = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.35,
            metalness: 0.1
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(randomRange(-6, 6), randomRange(-3, 3), randomRange(-6, 6));
        cube.userData = {
            baseColor: color.clone(),
            baseScale: cube.scale.clone(),
            selectionTime: 0,
            rotationSpeed: new THREE.Vector3(
                randomRange(0.002, 0.01),
                randomRange(0.002, 0.015),
                randomRange(0.001, 0.008)
            )
        };
        scene.add(cube);
        cubes.push(cube);
    }
}

function updateInfoPanel(cube) {
    if (!cube) {
        cubeInfoEl.textContent = defaultInfoText;
        cubeInfoEl.classList.add('placeholder');
        return;
    }

    const { x, y, z } = cube.position;
    const { width, height, depth } = cube.geometry.parameters;
    cubeInfoEl.classList.remove('placeholder');
    cubeInfoEl.innerHTML = `
        <strong>Position</strong>: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})<br>
        <strong>Size</strong>: (${width.toFixed(2)}, ${height.toFixed(2)}, ${depth.toFixed(2)})
    `;
}

function highlightCube(cube) {
    if (selectedCube === cube) return;

    if (selectedCube) {
        selectedCube.material.emissive.setRGB(0, 0, 0);
        selectedCube.material.emissiveIntensity = 0;
        selectedCube.scale.copy(selectedCube.userData.baseScale);
    }

    selectedCube = cube ?? null;

    if (selectedCube) {
        selectedCube.material.emissive.set(selectedCube.userData.baseColor);
        selectedCube.material.emissiveIntensity = 0.6;
        selectedCube.userData.selectionTime = performance.now();
    }

    updateInfoPanel(selectedCube);
}

function handlePointerDown(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersections = raycaster.intersectObjects(cubes);
    highlightCube(intersections[0]?.object ?? null);

    if (!intersections.length) {
        cubeInfoEl.textContent = 'No object selected.';
        cubeInfoEl.classList.add('placeholder');
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('pointerdown', handlePointerDown);
window.addEventListener('resize', onWindowResize);

spawnCubes(20);
updateInfoPanel(null);

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    cubes.forEach((cube) => {
        cube.rotation.x += cube.userData.rotationSpeed.x;
        cube.rotation.y += cube.userData.rotationSpeed.y;
        cube.rotation.z += cube.userData.rotationSpeed.z;
    });

    if (selectedCube) {
        const pulse = 1 + 0.08 * Math.sin((now - selectedCube.userData.selectionTime) * 0.01);
        selectedCube.scale.set(
            selectedCube.userData.baseScale.x * pulse,
            selectedCube.userData.baseScale.y * pulse,
            selectedCube.userData.baseScale.z * pulse
        );
    }

    renderer.render(scene, camera);
}

animate();
