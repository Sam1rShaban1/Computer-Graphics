import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;   
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
document.body.appendChild(renderer.domElement);

// --- Scene Setup ---
const scene = new THREE.Scene();
renderer.setClearColor(0x000000, 0);
const campusGroup = new THREE.Group();
scene.add(campusGroup);
campusGroup.scale.setScalar(0.01);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, -6, 3.5);
camera.up.set(0, 0, 1);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0.5);

// --- Lighting ---
const hemiLight = new THREE.HemisphereLight(0xB1E1FF, 0x3a2f27, 2);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xfff1cc, 2.8);
dirLight.position.set(300, -120, 240);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 220;
dirLight.shadow.camera.bottom = -220;
dirLight.shadow.camera.left = -220;
dirLight.shadow.camera.right = 220;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.target.position.set(0, 0, 0);
scene.add(dirLight);

const fillLight = new THREE.PointLight(0xffc38b, 0.6, 600);
fillLight.position.set(-180, -220, 140);
scene.add(fillLight);

const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 10);
dirLightHelper.visible = false;
scene.add(dirLightHelper);

const textureLoader = new THREE.TextureLoader();
const exrLoader = new EXRLoader();
const gltfLoader = new GLTFLoader();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const buildingMeshes = [];
let highlightedBuilding = null;
let buildingMaterialCursor = 0;

const infoPanel = document.createElement('div');
infoPanel.id = 'building-info-panel';
infoPanel.style.position = 'fixed';
infoPanel.style.bottom = '24px';
infoPanel.style.left = '24px';
infoPanel.style.maxWidth = '380px';
infoPanel.style.padding = '16px 18px';
infoPanel.style.background = 'rgba(12, 16, 24, 0.78)';
infoPanel.style.color = '#f4f6fb';
infoPanel.style.fontFamily = "'Segoe UI', sans-serif";
infoPanel.style.fontSize = '13px';
infoPanel.style.lineHeight = '1.45';
infoPanel.style.borderRadius = '12px';
infoPanel.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.35)';
infoPanel.style.pointerEvents = 'none';
infoPanel.style.backdropFilter = 'blur(6px)';
infoPanel.textContent = 'Click a building to view material details.';
document.body.appendChild(infoPanel);

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

//Asphalt Texture
const asphaltNormal = textureLoader.load('asphalt_track_2k.blend/textures/asphalt_track_disp_2k.png');
const asphaltDisplacement = textureLoader.load('asphalt_track_2k.blend/textures/asphalt_track_disp_2k.png');
const asphaltRoughness = textureLoader.load('asphalt_track_2k.blend/textures/asphalt_track_disp_2k.png');
const asphaltDiffuse = textureLoader.load('asphalt_track_2k.blend/textures/asphalt_track_diff_2k.jpg');
asphaltNormal.wrapS = THREE.RepeatWrapping;
asphaltNormal.wrapT = THREE.RepeatWrapping;
asphaltNormal.repeat.set(2, 2);
asphaltNormal.anisotropy = 16;

//Ground Texture
const groundNormal = textureLoader.load('brown_mud_leaves_01_2k.blend/textures/brown_mud_leaves_01_disp_2k.png');
const groundDisplacement = textureLoader.load('brown_mud_leaves_01_2k.blend/textures/brown_mud_leaves_01_disp_2k.png');
const groundRoughness = textureLoader.load('brown_mud_leaves_01_2k.blend/textures/brown_mud_leaves_01_disp_2k.png');
const groundDiffuse = textureLoader.load('brown_mud_leaves_01_2k.blend/textures/brown_mud_leaves_01_diff_2k.jpg');
[groundDiffuse, groundNormal, groundDisplacement, groundRoughness].forEach(tex => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(800, 800);
    tex.anisotropy = 16;
});

//Walkway Texture
const walkNormal = textureLoader.load('concrete_pavers_2k.blend/textures/concrete_pavers_disp_2k.png');
const walkDisplacement = textureLoader.load('concrete_pavers_2k.blend/textures/concrete_pavers_disp_2k.png');
const walkRoughness = textureLoader.load('concrete_pavers_2k.blend/textures/concrete_pavers_disp_2k.png');
const walkDiffuse = textureLoader.load('concrete_pavers_2k.blend/textures/concrete_pavers_diff_2k.jpg');
walkNormal.wrapS = THREE.RepeatWrapping;
walkNormal.wrapT = THREE.RepeatWrapping;
walkNormal.repeat.set(2, 2);
walkNormal.anisotropy = 16;

//Plaster Texture
const buildingNormal = textureLoader.load('plaster_grey_04_2k.blend/textures/plaster_grey_04_disp_2k.png');
const buildingDisplacement = textureLoader.load('plaster_grey_04_2k.blend/textures/plaster_grey_04_disp_2k.png');
const buildingRoughness = textureLoader.load('plaster_grey_04_2k.blend/textures/plaster_grey_04_disp_2k.png');
const buildingDiffuse = textureLoader.load('plaster_grey_04_2k.blend/textures/plaster_grey_04_diff_2k.jpg');
buildingNormal.wrapS = THREE.RepeatWrapping;
buildingNormal.wrapT = THREE.RepeatWrapping;
buildingNormal.repeat.set(2, 2);
buildingNormal.anisotropy = 16;

// Glass Facade Texture
const glassDiffuse = textureLoader.load('Glass_Facade001_2K-JPG/Facade001_2K-JPG_Color.jpg');
const glassNormal = textureLoader.load('Glass_Facade001_2K-JPG/Facade001_2K-JPG_NormalGL.jpg');
const glassRoughness = textureLoader.load('Glass_Facade001_2K-JPG/Facade001_2K-JPG_Roughness.jpg');
const glassMetalness = textureLoader.load('Glass_Facade001_2K-JPG/Facade001_2K-JPG_Metalness.jpg');
[glassDiffuse, glassNormal, glassRoughness, glassMetalness].forEach(tex => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
    tex.anisotropy = 8;
});

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

const plasterFacadeMaterial = new THREE.MeshPhysicalMaterial({
    map: buildingDiffuse,
    normalMap: buildingNormal,
    displacementMap: buildingDisplacement,
    displacementScale: 0.01,
    roughnessMap: buildingRoughness,
    metalness: 0.05,
    clearcoat: 0.4,
    clearcoatRoughness: 0.25
});
plasterFacadeMaterial.name = 'Plaster Facade';

const stoneFacadeMaterial = new THREE.MeshPhysicalMaterial({
    map: cobble,
    normalMap: cobbleNormal,
    displacementMap: cobbleHeight,
    displacementScale: 0.007,
    roughnessMap: cobbleRoughness,
    metalness: 0.02,
    clearcoat: 0.2,
    clearcoatRoughness: 0.4
});
stoneFacadeMaterial.name = 'Stone Facade';

const glassFacadeMaterial = new THREE.MeshPhysicalMaterial({
    map: glassDiffuse,
    normalMap: glassNormal,
    roughnessMap: glassRoughness,
    metalnessMap: glassMetalness,
    transmission: 0.92,
    transparent: true,
    opacity: 0.9,
    reflectivity: 0.5,
    ior: 1.45,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    metalness: 0.1
});
glassFacadeMaterial.name = 'Glass Facade';

const buildingMaterials = [
    {
        material: plasterFacadeMaterial,
        label: 'Plaster Facade',
        textures: [
            'plaster_grey_04_2k.blend/textures/plaster_grey_04_diff_2k.jpg',
            'plaster_grey_04_2k.blend/textures/plaster_grey_04_nor_gl_2k.exr'
        ],
        colorDescription: 'Neutral plaster with subtle roughness.'
    },
    {
        material: stoneFacadeMaterial,
        label: 'Stone Facade',
        textures: [
            'textures/Stylized_Stone_Floor_010_basecolor.png',
            'textures/Stylized_Stone_Floor_010_normal.png'
        ],
        colorDescription: 'Textured stone surface with cool tones.'
    },
    {
        material: glassFacadeMaterial,
        label: 'Glass Facade',
        textures: [
            'Glass_Facade001_2K-JPG/Facade001_2K-JPG_Color.jpg',
            'Glass_Facade001_2K-JPG/Facade001_2K-JPG_NormalGL.jpg'
        ],
        colorDescription: 'Reflective glass curtain wall.'
    }
];

// Grass: Simple, matte green
const groundMaterial = new THREE.MeshStandardMaterial({
    map: groundDiffuse,
    normalMap: groundNormal,
    displacementMap: groundDisplacement,
    displacementScale: 0.0001,
    roughnessMap: groundRoughness
});

// --- Environment ---
scene.fog = new THREE.Fog(0xADD8E6, 300, 800); // Light blue fog, matches the sky gradient

// --- Ground Plane ---
const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), groundMaterial);
ground.position.z = -0.1;
ground.receiveShadow = true;
campusGroup.add(ground);

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
                campusGroup.add(mesh);

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
                const featureName = feature.properties?.name || feature.properties?.NAME || feature.properties?.building || 'Campus Building';
                polygons.forEach(polygon => {
                    if (!polygon || !polygon[0] || polygon[0].length < 3) return;
                    const shape = new THREE.Shape();
                    polygon[0].forEach((coord, i) => {
                        const [x, y] = projectCoord(coord);
                        i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
                    });

                    let extrudeSettings;
                    let material;
                    let buildingInfo = null;

                    if (options.isBuilding && Array.isArray(options.materials) && options.materials.length) {
                        const height = Number(feature.properties?.estimated_height) || 10;
                        extrudeSettings = { depth: height, bevelEnabled: false };

                        const materialDescriptor = options.materials[buildingMaterialCursor % options.materials.length];
                        buildingMaterialCursor += 1;
                        const baseMaterial = materialDescriptor.material;
                        material = baseMaterial.clone();
                        material.name = baseMaterial.name;

                        buildingInfo = {
                            name: featureName,
                            heightMeters: height,
                            material: materialDescriptor.label,
                            colorDescription: materialDescriptor.colorDescription,
                            textures: materialDescriptor.textures
                        };
                    } else {
                        extrudeSettings = options.extrudeSettings;
                        material = options.material;
                    }

                    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.position.z = options.y_position || 0;
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;

                    if (buildingInfo) {
                        mesh.userData.buildingInfo = buildingInfo;
                        if (mesh.material && mesh.material.emissive) {
                            mesh.material.emissiveIntensity = 0.2;
                        }
                        buildingMeshes.push(mesh);
                    }

                    campusGroup.add(mesh);
                });
            });
        });
}

// --- Load All Data ---
loadWalkwaysWithHoles();
loadGeoJson('data/roads.geojson', { material: roadMaterial, extrudeSettings: { depth: 0.1 }, y_position: 0.01 });
loadGeoJson('data/SEEUcampus.geojson', { materials: buildingMaterials, isBuilding: true });

const LOCAL_TREE_URL = 'jacaranda_tree_1k.gltf/jacaranda_tree_1k.gltf';
const FALLBACK_TREE_URL = 'https://threejs.org/examples/models/gltf/Tree.glb';

function placeTree(treeScene) {
    treeScene.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });
    treeScene.scale.setScalar(3);
    treeScene.position.set(180, 80, 0);
    treeScene.rotation.y = 0;
    campusGroup.add(treeScene);
}

function loadTreeModel(url, onError) {
    gltfLoader.load(
        url,
        (gltf) => {
            placeTree(gltf.scene);
        },
        undefined,
        (error) => {
            if (onError) {
                onError(error);
            } else {
                console.warn('Unable to load GLTF asset.', error);
            }
        }
    );
}

loadTreeModel(LOCAL_TREE_URL, () => {
    console.warn('Local Jacaranda tree GLB not found. Falling back to remote sample.');
    loadTreeModel(FALLBACK_TREE_URL);
});

const SUN_ORBIT_RADIUS = 420;
const SUN_SPEED = 0.006;
let sunAngle = 0.0;

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

function updateInfoPanel(info) {
    if (!info) {
        infoPanel.innerHTML = 'Click a building to view material details.';
        return;
    }

    const textureList = info.textures
        .map(path => `<li>${path}</li>`)
        .join('');

    infoPanel.innerHTML = `
        <strong>${info.name}</strong><br/>
        Height: ${info.heightMeters.toFixed(1)} m<br/>
        Material: ${info.material}<br/>
        <span style="opacity:0.8">${info.colorDescription}</span>
        <br/><br/>
        <strong>Textures</strong>
        <ul style="margin:4px 0 0 16px; padding:0;">
            ${textureList}
        </ul>
    `;
}

function handlePointerClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(buildingMeshes, true);

    if (intersects.length > 0) {
        const mesh = intersects[0].object;
        const info = mesh.userData.buildingInfo;
        highlightBuilding(mesh);
        updateInfoPanel(info);
    } else {
        highlightBuilding(null);
        updateInfoPanel(null);
    }
}

renderer.domElement.addEventListener('pointerdown', handlePointerClick);

// --- Animation Loop ---
function animate() {
  requestAnimationFrame(animate);
  sunAngle = (sunAngle + SUN_SPEED) % (Math.PI * 2);
  const sunX = Math.cos(sunAngle) * SUN_ORBIT_RADIUS;
  const sunY = Math.sin(sunAngle) * SUN_ORBIT_RADIUS;
  const sunZ = THREE.MathUtils.mapLinear(Math.sin(sunAngle), -1, 1, 80, 260);
  dirLight.position.set(sunX, sunY, sunZ);
  dirLight.target.position.set(0, 0, 0);
  dirLight.target.updateMatrixWorld();
  dirLightHelper.update();

  controls.update();
  renderer.render(scene, camera);
}
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
animate();