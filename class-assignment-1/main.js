import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue background
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// const geometry = new THREE.BoxGeometry(1,1,1);
// const material = new THREE.MeshStandardMaterial({ color: 0xf5424e });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// Transformations

// cube.position.x = 0.7
// cube.position.y = -0.6
// cube.position.z = 0.5



const axes = new THREE.AxesHelper(4)
scene.add(axes)

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

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(3,3,3);
scene.add(light);

const group = new THREE.Group()
group.scale.x = .5
group.scale.y = 1
// group.position.y = .5
group.rotation.x = Math.PI * .25
scene.add(group)

const x = 0, y = 0;

const heartShape = new THREE.Shape();

heartShape.moveTo( x + 5, y + 5 );
heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

const geometry = new THREE.ShapeGeometry( heartShape );
const material = new THREE.MeshBasicMaterial( { color: "red" } );``
const heart = new THREE.Mesh( geometry, material ) ;
heart.scale.set(.05,.05,.05)
scene.add( heart );

group.add(heart)

const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(1,1,1), 
    new THREE.MeshStandardMaterial({color: "blue"})
)
cylinder.position.x = 3
group.add(cylinder)

const capsule = new THREE.Mesh(
    new THREE.CapsuleGeometry(1,1,1), 
    new THREE.MeshStandardMaterial({color: "green"})
)
capsule.position.x = -3
group.add(capsule)


function animate() {
    requestAnimationFrame(animate);
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.05;
    // cube.rotation.z += 0.03;
    renderer.render(scene, camera);
}

animate();
