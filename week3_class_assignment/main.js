import * as THREE from 'three';
import { emissive, metalness, roughness } from 'three/tsl';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x00001f);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10
camera.position.y = 2
camera.rotation.z = (Math.PI)

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(800, 600);
document.body.appendChild(renderer.domElement);

// const geometry = new THREE.BoxGeometry(1,1,1);
// const material = new THREE.MeshStandardMaterial({ color: 0xf5424e });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// Transformations

// cube.position.x = 0.7
// cube.position.y = -0.6
// cube.position.z = 0.5



// const axes = new THREE.AxesHelper(4)
// scene.add(axes)

// Scaling

// cube.scale.x = 4
// cube.scale.y = 0.3
// cube.scale.z = 0.75


// Rotation

// cube.rotation.x = Math.PI * 2
// cube.rotation.y = Math.PI * .25
// cube.rotation.z = Math.PI * .65

// cube.position.set(0.7,-0.6,0.5)

// console.log("Distance tof cube from camera", cube.position.distanceTo(camera.position))
// cube.scale.set(4,0.3,0.75)
// cube.rotation.set(Math.PI * 2, Math.PI * .25, Math.PI * .65)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(3,3,3);
scene.add(directionalLight);

const lightHelper = new THREE.DirectionalLightHelper(directionalLight)
scene.add(lightHelper)

const ground = new THREE.PlaneGeometry(100,100)
const groundMaterial = new THREE.MeshStandardMaterial({color: "lightgray", metalness: 0.7, roughness: 0.2})
const plane = new THREE.Mesh( ground, groundMaterial) ;
plane.rotation.x = -Math.PI / 2; // make it a floor
plane.position.y = -1;  
scene.add( plane );

// const group = new THREE.Group()
// group.scale.x = .5
// group.scale.y = 1
// // group.position.y = .5
// group.rotation.x = Math.PI * .25
// scene.add(group)

const x = 0, y = 0;

// const geometry = new THREE.SphereGeometry(1, 12, 25);
const geometry = new THREE.CapsuleGeometry(1, 3, 20)
// const material = new THREE.MeshBasicMaterial( { color: "red", wireframe:true } );
// const material = new THREE.MeshLambertMaterial({color: "blue", wireframe:true});
const material = new THREE.MeshStandardMaterial({color: "purple", metalness: 0.7, roughness: 0.2})
const capsule = new THREE.Mesh( geometry, material) ;
capsule.rotateX(Math.PI / 2)
capsule.rotateZ(Math.PI / 2)

scene.add( capsule );

const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(1,1,1), 
    new THREE.MeshStandardMaterial({color: "blue", metalness: 0.1, roughness:0.8})
)
cylinder.position.x = 5
scene.add(cylinder)

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1,3,3), 
    new THREE.MeshStandardMaterial({color: "red", metalness: 0.3, roughness: 0.4})
)
cube.position.x = -5
scene.add(cube)


function animate() {
    requestAnimationFrame(animate);
    // capsule.rotation.x += 0.01;
    // capsule.rotation.y += 0.01;
    capsule.rotation.z += 0.02;
    renderer.render(scene, camera);
}

animate();
