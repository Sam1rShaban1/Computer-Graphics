import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;   
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

// --- Scene Setup ---
const scene = new THREE.Scene();
renderer.setClearColor(0x000000, 0);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, -200, 150);
camera.up.set(0, 0, 1);


// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

// --- Lighting ---
const hemiLight = new THREE.HemisphereLight(0xB1E1FF, 0x444444, 1.0); // Sky color, Ground color, Intensity
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(200, -50, 200);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 200;
dirLight.shadow.camera.bottom = -200;
dirLight.shadow.camera.left = -200;
dirLight.shadow.camera.right = 200;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.target.position.set(100, 250, 60);
scene.add(dirLight);

const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 10);
dirLightHelper.visible = false;
scene.add(dirLightHelper);

const textureLoader = new THREE.TextureLoader();
const exrLoader = new EXRLoader();

// Coblle Texture
const cobble = textureLoader.load('textures/Stylized_Stone_Floor_010_basecolor.png');
const cobbleHeight = textureLoader.load('textures/Stylized_Stone_Floor_010_height.png');
const cobbleNormal = textureLoader.load('textures/Stylized_Stone_Floor_010_normal.png');
const cobbleRoughness = textureLoader.load('textures/Stylized_Stone_Floor_010_roughness.png');
const coobbleAO = textureLoader.load('textures/Stylized_Stone_Floor_010_ambientOcclusion.png');
cobble.wrapS = THREE.RepeatWrapping;
cobble.wrapT = THREE.RepeatWrapping;
cobble.repeat.set(2, 2);
cobble.anisotropy = 16;

// Wood Texture
const wood = textureLoader.load('textures/Stylized_Wood_Floor_001_basecolor.png');
wood.wrapS = THREE.RepeatWrapping;
wood.wrapT = THREE.RepeatWrapping;
wood.repeat.set(2, 2);
wood.anisotropy = 16;

//Asphalt Texture
const asphaltNormal = exrLoader.load('asphalt_track_2k.blend/textures/asphalt_track_nor_gl_2k.exr');
const asphaltDisplacement = textureLoader.load('asphalt_track_2k.blend/textures/asphalt_track_disp_2k.png');
const asphaltRoughness = exrLoader.load('asphalt_track_2k.blend/textures/asphalt_track_rough_2k.exr');
const asphaltDiffuse = textureLoader.load('asphalt_track_2k.blend/textures/asphalt_track_diff_2k.jpg');
asphaltNormal.wrapS = THREE.RepeatWrapping;
asphaltNormal.wrapT = THREE.RepeatWrapping;
asphaltNormal.repeat.set(2, 2);
asphaltNormal.anisotropy = 16;

//Ground Texture
const groundNormal = exrLoader.load('brown_mud_leaves_01_2k.blend/textures/brown_mud_leaves_01_nor_gl_2k.exr');
const groundDisplacement = textureLoader.load('brown_mud_leaves_01_2k.blend/textures/brown_mud_leaves_01_disp_2k.png');
const groundRoughness = exrLoader.load('brown_mud_leaves_01_2k.blend/textures/brown_mud_leaves_01_rough_2k.exr');
const groundDiffuse = textureLoader.load('brown_mud_leaves_01_2k.blend/textures/brown_mud_leaves_01_diff_2k.jpg');
groundNormal.wrapS = THREE.RepeatWrapping;
groundNormal.wrapT = THREE.RepeatWrapping;
groundNormal.repeat.set(100, 100);
groundNormal.anisotropy = 16;

//Walkway Texture
const walkNormal = exrLoader.load('concrete_pavers_2k.blend/textures/concrete_pavers_nor_gl_2k.exr');
const walkDisplacement = textureLoader.load('concrete_pavers_2k.blend/textures/concrete_pavers_disp_2k.png');
const walkRoughness = exrLoader.load('concrete_pavers_2k.blend/textures/concrete_pavers_rough_2k.exr');
const walkDiffuse = textureLoader.load('concrete_pavers_2k.blend/textures/concrete_pavers_diff_2k.jpg');
walkNormal.wrapS = THREE.RepeatWrapping;
walkNormal.wrapT = THREE.RepeatWrapping;
walkNormal.repeat.set(2, 2);
walkNormal.anisotropy = 16;

//Plaster Texture
const buildingNormal = exrLoader.load('plaster_grey_04_2k.blend/textures/plaster_grey_04_nor_gl_2k.exr');
const buildingDisplacement = textureLoader.load('plaster_grey_04_2k.blend/textures/plaster_grey_04_disp_2k.png');
const buildingRoughness = exrLoader.load('plaster_grey_04_2k.blend/textures/plaster_grey_04_rough_2k.exr');
const buildingDiffuse = textureLoader.load('plaster_grey_04_2k.blend/textures/plaster_grey_04_diff_2k.jpg');
buildingNormal.wrapS = THREE.RepeatWrapping;
buildingNormal.wrapT = THREE.RepeatWrapping;
buildingNormal.repeat.set(2, 2);
buildingNormal.anisotropy = 16;
// Asphalt: Dark, non-metallic, very rough surface
const roadMaterial = new THREE.MeshStandardMaterial({
    map: asphaltDiffuse,
    normalMap: asphaltNormal,
    displacementMap: asphaltDisplacement,
    displacementScale: 0.01,
    roughnessMap: asphaltRoughness
});

// Concrete/Cobblestone: Lighter, non-metallic, slightly less rough
const walkwayMaterial = new THREE.MeshStandardMaterial({
    map: walkDiffuse,
    normalMap: walkNormal,
    displacementMap: walkDisplacement,
    displacementScale: 0.01,
    roughnessMap: walkRoughness
});

// Modern Building Facade: Can simulate glass/coated panels
const buildingColors = [
    0xADD8E6, // Light Blue
    0x00FFFF, // Cyan
    0xFFFFE0  // Light Yellow
];
const buildingMaterial = new THREE.MeshPhysicalMaterial({
    map: buildingDiffuse,
    normalMap: buildingNormal,
    displacementMap: buildingDisplacement,
    displacementScale: 0.01,
    roughnessMap: buildingRoughness
});

// Grass: Simple, matte green
const groundMaterial = new THREE.MeshStandardMaterial({
    map: groundDiffuse,
    normalMap: groundNormal,
    displacementMap: groundDisplacement,
    displacementScale: 0.01,
    roughnessMap: groundRoughness
});

// --- Environment ---
scene.fog = new THREE.Fog(0xADD8E6, 300, 800); // Light blue fog, matches the sky gradient

// --- Ground Plane ---
const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), groundMaterial);
ground.position.z = -0.1;
ground.receiveShadow = true;
scene.add(ground);

// --- Data Loading Logic ---
function projectCoord([lon, lat]) {
  const scale = 100000;
  return [(lon - 20.96) * scale, (lat - 41.985) * scale];
}

function loadWalkwaysWithHoles() {
    fetch('data/walkways.geojson')
        .then(res => res.json())
        .then(data => {
            const mainPolygons = data.features.filter(f => f.properties.fill !== '#ff0000');
            const holeFeatures = data.features.filter(f => f.properties.fill === '#ff0000');
            const allHolePaths = holeFeatures.map(holeFeature => {
                const holePath = new THREE.Path();
                holeFeature.geometry.coordinates[0].forEach((coord, i) => {
                    const [x, y] = projectCoord(coord);
                    i === 0 ? holePath.moveTo(x, y) : holePath.lineTo(x, y);
                });
                return holePath;
            });

            mainPolygons.forEach(mainFeature => {
                const shape = new THREE.Shape();
                mainFeature.geometry.coordinates[0].forEach((coord, i) => {
                    const [x, y] = projectCoord(coord);
                    i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
                });
                shape.holes = allHolePaths;
                const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
                const mesh = new THREE.Mesh(geometry, walkwayMaterial);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                scene.add(mesh);

            });
        });
}

function loadGeoJson(url, options) {
    fetch(url)
        .then(res => res.json())
        .then(data => {
            // The forEach loop gives us access to each individual "feature"
            data.features.forEach(feature => {
                const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
                polygons.forEach(polygon => {
                    if (!polygon || !polygon[0] || polygon[0].length < 3) return;
                    const shape = new THREE.Shape();
                    polygon[0].forEach((coord, i) => {
                        const [x, y] = projectCoord(coord);
                        i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
                    });

                    let extrudeSettings;
                    let material;
                    
                    if (options.isBuilding) {
                        const height = feature.properties.estimated_height || 10;
                        extrudeSettings = { depth: height, bevelEnabled: false };
                        material = new THREE.MeshPhysicalMaterial({
                            metalness: 0.1, roughness: 0.5,
                            clearcoat: 0.5, clearcoatRoughness: 0.3,
                            map: cobble
                        });
                    } else {
                        extrudeSettings = options.extrudeSettings;
                        material = options.material;
                    }

                    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.position.z = options.y_position || 0;
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    scene.add(mesh);
                });
            });
        });
}

// --- Load All Data ---
loadWalkwaysWithHoles();
loadGeoJson('data/roads.geojson', { material: roadMaterial, extrudeSettings: { depth: 0.1 }, y_position: 0.01 });
loadGeoJson('data/SEEUcampus.geojson', { material: buildingMaterial, isBuilding: true });

// --- Animation Loop ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
animate();