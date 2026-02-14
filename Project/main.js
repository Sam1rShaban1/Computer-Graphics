// SEEU Campus Evolution - Main Application
// Complete 3D campus visualization system with timeline, LOD, and procedural nature

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { VignetteShader } from 'three/addons/shaders/VignetteShader.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';

// Import new systems
import { IntroBanner } from './src/introBanner.js';
import { TimelineUI } from './src/timelineUI.js';
import { BuildingAnimator } from './src/buildingAnimator.js';
import { BuildingInfoPanel } from './src/buildingInfoPanel.js';
import { GroundSystem } from './src/groundSystem.js';
import { ProceduralNature } from './src/proceduralNature.js';
import { DynamicLighting } from './src/dynamicLighting.js';
import { CameraController } from './src/cameraController.js';
import { CampusInfrastructure } from './src/campusInfrastructure.js';
import { BUILDING_TIMELINE, BUILDING_INFO, TIMELINE_YEARS } from './src/buildingData.js';

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ 
    alpha: true,
    powerPreference: 'high-performance'
});
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
camera.position.set(98.00, -49.08, 176.24);
camera.up.set(0, 0, 1);

// Camera looks at building 303 location
const building303Target = new THREE.Vector3(138.01, 116.83, 2.50);
camera.lookAt(building303Target);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 50;
controls.maxDistance = 1000;
controls.maxPolarAngle = Math.PI * 0.52; // Allow lower camera angle
controls.minPolarAngle = 0.05;
controls.target.copy(building303Target);
controls.update();

// Post-processing Setup
const composer = new EffectComposer(renderer);

// Render pass
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Bloom pass - optimized settings
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.25,  // slightly lower strength
    0.4,   // radius
    0.9    // higher threshold = less bloom
);
composer.addPass(bloomPass);

// Vignette pass - cinematic edges
const vignettePass = new ShaderPass(VignetteShader);
vignettePass.uniforms['offset'].value = 0.95;
vignettePass.uniforms['darkness'].value = 1.0;
composer.addPass(vignettePass);

// Gamma correction
const gammaPass = new ShaderPass(GammaCorrectionShader);
composer.addPass(gammaPass);

// FXAA - anti-aliasing
const fxaaPass = new ShaderPass(FXAAShader);
fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
composer.addPass(fxaaPass);
// Initialize Systems
const introBanner = new IntroBanner();
const groundSystem = new GroundSystem(scene);
const proceduralNature = new ProceduralNature(scene);
const campusInfrastructure = new CampusInfrastructure(scene);
const dynamicLighting = new DynamicLighting(scene, camera);
const cameraController = new CameraController(camera, controls);
const timelineUI = new TimelineUI(
    (year, animate) => handleYearChange(year, animate),
    (isPlaying) => {
        cameraController.setAutoPlay(isPlaying);
    }
);
const buildingAnimator = new BuildingAnimator(scene);
const infoPanel = new BuildingInfoPanel();

// Ground with grass texture
const ground = groundSystem.createGround();
scene.add(ground);

// Lighting
dynamicLighting.setup();

// Load walkways and roads
async function loadInfrastructure() {
    await campusInfrastructure.loadInfrastructure();
}

// Trees
async function loadTrees() {
    const trees = await proceduralNature.createForest();
    scene.add(trees);
}

// Load Buildings
loadBuildings();

// Start loading immediately while banner is shown
const infrastructurePromise = loadInfrastructure();
const treesPromise = loadTrees();

// Show banner - wait for user click
introBanner.show(async () => {
    // Wait for assets to finish loading
    await Promise.all([infrastructurePromise, treesPromise]);
    
    animate(0);
    console.log('SEEU Campus Evolution System Started');
});

// Raycasting
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let highlightedBuilding = null;
const raycastableObjects = [];

// Register buildings for raycasting
function registerRaycastable(mesh) {
    raycastableObjects.push(mesh);
}

// Handle Click
function handlePointerClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(raycastableObjects, true);

    if (intersects.length > 0) {
        const mesh = intersects[0].object;
        const buildingName = mesh.userData.buildingName;
        
        if (buildingName) {
            highlightBuilding(mesh);
            infoPanel.update(buildingName);
            cameraController.focusOnBuilding(mesh);
        }
    } else {
        highlightBuilding(null);
        infoPanel.update(null);
    }
}

function highlightBuilding(mesh) {
    // Restore previous building's emissive
    if (highlightedBuilding) {
        const originalEmissive = highlightedBuilding.userData.originalEmissive;
        if (originalEmissive !== undefined) {
            highlightedBuilding.material.emissive.setHex(originalEmissive);
        } else {
            highlightedBuilding.material.emissive.setHex(0x000000);
        }
    }
    
    if (mesh?.material?.emissive) {
        // Save original emissive
        mesh.userData.originalEmissive = mesh.material.emissive.getHex();
        // Set highlight
        mesh.material.emissive.setHex(0x1a304c);
        highlightedBuilding = mesh;
    } else {
        highlightedBuilding = null;
    }
}

renderer.domElement.addEventListener('pointerdown', handlePointerClick);

// Year Change Handler
function handleYearChange(year, animate = true) {
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
    
    // Determine building year from timeline data
    let buildingYear = 2026;
    for (const [year, buildings] of Object.entries(BUILDING_TIMELINE)) {
        if (buildings.includes(buildingName)) {
            buildingYear = parseInt(year);
            break;
        }
    }
    
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
            mesh.userData.buildingYear = buildingYear;
            buildingAnimator.registerBuilding(buildingName, mesh);
            registerRaycastable(mesh);
            
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
        metalness: 0.1
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
    
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap at 100ms
    lastTime = currentTime;
    
    // Update systems
    dynamicLighting.update(deltaTime);
    cameraController.update(deltaTime);
    buildingAnimator.update(deltaTime);
    
    // Update orbit controls
    controls.update();
    
    // Prevent camera from going below ground
    if (camera.position.z < 2) {
        camera.position.z = 2;
    }
    
    // Render with post-processing
    composer.render();
}

// Window Resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
    composer.setSize(width, height);
    
    // Update FXAA resolution
    fxaaPass.uniforms['resolution'].value.set(1 / width, 1 / height);
    
    // Update bloom resolution
    bloomPass.resolution.set(width, height);
});

// Start
introBanner.show(() => {
    animate(0);
    console.log('SEEU Campus Evolution System Started');
});
