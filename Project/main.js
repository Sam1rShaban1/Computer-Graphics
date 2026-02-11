// SEEU Campus Evolution - Main Application
// Complete 3D campus visualization system with timeline, LOD, and procedural nature

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Import new systems
import { IntroBanner } from './src/introBanner.js';
import { TimelineUI } from './src/timelineUI.js';
import { BuildingAnimator } from './src/buildingAnimator.js';
import { BuildingInfoPanel } from './src/buildingInfoPanel.js';
import { GroundSystem } from './src/groundSystem.js';
import { ProceduralNature } from './src/proceduralNature.js';
import { DynamicLighting } from './src/dynamicLighting.js';
import { CameraController } from './src/cameraController.js';
import { BUILDING_TIMELINE, BUILDING_INFO, TIMELINE_YEARS } from './src/buildingData.js';

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// Scene Setup - Z is UP
const scene = new THREE.Scene();
renderer.setClearColor(0x87CEEB, 1);

// Camera Setup - Z is up in world space
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
camera.position.set(200, 150, 80);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 50;
controls.maxDistance = 1000;
controls.maxPolarAngle = Math.PI * 0.8;
controls.target.set(0, 0, 0);
controls.update();

// Log camera position for reference
let frameCount = 0;
function logCameraPosition() {
    frameCount++;
    if (frameCount % 60 === 0) { // Log every 60 frames (approximately 1 second)
        console.log('Camera position:', 
            `x: ${camera.position.x.toFixed(2)}, ` +
            `y: ${camera.position.y.toFixed(2)}, ` +
            `z: ${camera.position.z.toFixed(2)}`
        );
    }
}

// Initialize Systems
const introBanner = new IntroBanner();
const groundSystem = new GroundSystem(scene);
const proceduralNature = new ProceduralNature(scene);
const dynamicLighting = new DynamicLighting(scene, camera);
const cameraController = new CameraController(camera, controls);
const timelineUI = new TimelineUI(
    (year, animate) => handleYearChange(year, animate),
    (isPlaying) => {
        console.log('Timeline playing:', isPlaying);
        cameraController.setAutoPlay(isPlaying);
    }
);
const buildingAnimator = new BuildingAnimator(scene, camera, controls);
const infoPanel = new BuildingInfoPanel();

// Ground with grass texture
const ground = groundSystem.createGround();
scene.add(ground);

// Lighting
dynamicLighting.setup();

// Trees
const trees = proceduralNature.createForest();
scene.add(trees);

// Load Buildings
loadBuildings();

// Raycasting
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let highlightedBuilding = null;

// Handle Click
function handlePointerClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const mesh = intersects[0].object;
        const buildingName = mesh.userData.buildingName;
        
        if (buildingName) {
            highlightBuilding(mesh);
            const buildingInfo = buildingAnimator.getBuildingInfo(buildingName);
            infoPanel.update(buildingName);
            cameraController.focusOnBuilding(mesh);
        }
    } else {
        highlightBuilding(null);
        infoPanel.update(null);
    }
}

function highlightBuilding(mesh) {
    if (highlightedBuilding && highlightedBuilding.material?.emissive) {
        highlightedBuilding.material.emissive.setHex(0x000000);
    }
    if (mesh?.material?.emissive) {
        mesh.material.emissive.setHex(0x1a304c);
        highlightedBuilding = mesh;
    } else {
        highlightedBuilding = null;
    }
}

renderer.domElement.addEventListener('pointerdown', handlePointerClick);

// Year Change Handler
function handleYearChange(year, animate = true) {
    console.log('Year changed to:', year);
    buildingAnimator.showBuildingsUpToYear(year, animate);
    dynamicLighting.setYear(year);
}

// Load Buildings
function loadBuildings() {
    const buildingFiles = [
        'building_001.geojson', 'building_101.geojson', 'building_101_classes.geojson', 'building_101_under.geojson',
        'building_301.geojson', 'building_302.geojson', 'building_303.geojson', 'building_304.geojson', 'building_315.geojson',
        'building_400.geojson', 'building_803.geojson', 'building_804.geojson', 'building_805.geojson', 'building_806.geojson',
        'building_807.geojson', 'building_808.geojson', 'building_809.geojson', 'building_810.geojson', 'building_811.geojson',
        'building_812.geojson', 'building_813.geojson', 'building_816.geojson', 'building_817.geojson', 'building_818.geojson',
        'building_1001.geojson', 'building_1002.geojson', 'building_dorm1.geojson', 'building_dorm2.geojson', 'building_dorm3.geojson',
        'building_dorm4.geojson', 'building_dorm5.geojson', 'building_dorm6.geojson', 'building_dorm7.geojson', 'building_dorm8.geojson',
        'building_dorm9.geojson', 'building_library.geojson', 'building_library1.geojson', 'building_lh1.geojson', 'building_lh2.geojson',
        'building_cantine.geojson', 'building_cantine_inside.geojson', 'building_conn.geojson', 'building_change_room.geojson',
        'building_pavillion.geojson', 'building_misc.geojson', 'building_book_shop.geojson', 'building_tech_park.geojson',
        'building_solar_1.geojson', 'building_solar_2.geojson', 'building_student_service_1.geojson', 'building_student_service_2.geojson',
        'building_empty.geojson', 'building_idk.geojson'
    ];

    let loaded = 0;
    const total = buildingFiles.length;
    
    function loadNext() {
        if (loaded >= total) {
            console.log(`All ${total} buildings loaded`);
            startTimeline();
            return;
        }
        
        const fileName = buildingFiles[loaded];
        const url = `campus/buildings/${fileName}`;
        
        fetch(url)
            .then(res => res.json())
            .then(data => {
                processBuildingData(data, fileName);
                loaded++;
                loadNext();
            })
            .catch(err => {
                console.warn(`Failed to load ${fileName}:`, err);
                loaded++;
                loadNext();
            });
    }
    
    loadNext();
}

function processBuildingData(data, fileName) {
    const buildingName = fileName.replace(/^building_/, '').replace(/\.geojson$/, '');
    
    if (!data.features || data.features.length === 0) return;
    
    data.features.forEach(feature => {
        const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
        const height = Number(feature.properties?.estimated_height) || 10;
        
        polygons.forEach(polygon => {
            if (!polygon || !polygon[0] || polygon[0].length < 3) return;
            
            const shape = new THREE.Shape();
            polygon[0].forEach((coord, i) => {
                const [x, y] = projectCoord(coord);
                i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
            });
            
            const extrudeSettings = { depth: height, bevelEnabled: false };
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            
            const material = createBuildingMaterial(buildingName);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.z = 0;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            mesh.userData.buildingName = buildingName;
            buildingAnimator.registerBuilding(buildingName, mesh);
            
            scene.add(mesh);
        });
    });
}

function projectCoord([lon, lat]) {
    const scale = 100000;
    return [(lon - 20.96) * scale, (lat - 41.985) * scale];
}

function createBuildingMaterial(buildingName) {
    const isDorm = buildingName.includes('dorm');
    const isLibrary = buildingName.includes('library');
    const isAcademic = /^\d{3}$/.test(buildingName) || buildingName.includes('lh');
    
    let color = 0x87CEEB;
    if (isDorm) color = 0xDEB887;
    if (isLibrary) color = 0x8B4513;
    if (isAcademic) color = 0xADD8E6;
    
    return new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.7,
        metalness: 0.1,
        emissive: 0x000000,
        emissiveIntensity: 0.1
    });
}

function startTimeline() {
    // Start at 2001
    buildingAnimator.showBuildingsUpToYear(2001, true);
}

// Animation Loop
let lastTime = 0;
function animate(currentTime) {
    requestAnimationFrame(animate);
    
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    // Update systems
    dynamicLighting.update(deltaTime);
    cameraController.update(deltaTime);
    buildingAnimator.update(deltaTime);
    
    // Update controls
    controls.update();
    
    // Log camera position every second
    logCameraPosition();
    
    // Render
    renderer.render(scene, camera);
}

// Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start
introBanner.show(() => {
    animate(0);
    console.log('SEEU Campus Evolution System Started');
});
