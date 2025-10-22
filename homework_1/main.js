import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd0e0f0);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, -150, 100);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(50, -50, 100);
scene.add(light);

const plane = new THREE.PlaneGeometry(10000, 10000);
const material = new THREE.MeshLambertMaterial({ color: 0x3f51b5 });
const mesh = new THREE.Mesh(plane, material);
scene.add(mesh);
// 🗺️ Project longitude/latitude to 2D plane
function projectCoord([lon, lat]) {
  const scale = 100000;
  return [(lon - 20.96) * scale, (lat - 41.985) * scale];
}

// 📥 Load GeoJSON file and convert features to 3D
fetch('data/SEEUcampus.geojson')
  .then(res => res.json())
  .then(data => {
    data.features.forEach(feature => {
      const type = feature.geometry.type;
      const coords = feature.geometry.coordinates;
      const polys = type === 'Polygon' ? [coords] : coords;

      polys.forEach(polygon => {
        const shape = new THREE.Shape();
        polygon[0].forEach((coord, i) => {
          const [x, y] = projectCoord(coord);
          i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
        });

        for (let i = 1; i < polygon.length; i++) {
          const hole = new THREE.Path();
          polygon[i].forEach((coord, j) => {
            const [x, y] = projectCoord(coord);
            j === 0 ? hole.moveTo(x, y) : hole.lineTo(x, y);
          });
          shape.holes.push(hole);
        }

        const extrude = new THREE.ExtrudeGeometry(shape, {
          depth: 10 + Math.random() * 30,
          bevelEnabled: false
        });

        const material = new THREE.MeshLambertMaterial({ color: 0x3f51b5 });
        const mesh = new THREE.Mesh(extrude, material);
        scene.add(mesh);
      });
    });
  });

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
