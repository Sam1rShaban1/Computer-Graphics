import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {RectAreaLightHelper} from 'three/examples/jsm/helpers/RectAreaLightHelper.js'

const sizes = {
    width: 800,
    height: 600
}

const cursor = {x:0, y:0}

window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020)

const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1,5,5,5),
    new THREE.MeshBasicMaterial({color:0xff0000, wireframe:true})
)

const material = new THREE.MeshStandardMaterial();

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    material
);

scene.add(mesh)

// const camera = new THREE.PerspectiveCamera(75, sizes.width/sizes.height, 0.1, 100)

// camera.position.z = 3

const aspectRatio = sizes.width/sizes.height
const camera = new THREE.OrthographicCamera(
    -1 * aspectRatio,
    1 * aspectRatio,
    1,
    -1,
    0.1,
    100
)

camera.position.z = 3

const renderer = new THREE.WebGLRenderer({antialias:true})
renderer.setSize(sizes.width, sizes.height)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, render.domElement)
controls.enableDamping = true

const animate = () =>{
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

animate()

window.addEventListener('resize', () =>{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width/sizes.height

    camera.updateProjectionMatrix(
        renderer.setSize(sizes.width,sizes.height)
    )
})