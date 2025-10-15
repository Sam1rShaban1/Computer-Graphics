import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {RectAreaLightHelper} from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
import GUI from 'lil-gui'

const gui = new GUI()

const scene = new THREE.Scene();

const material = new THREE.MeshStandardMaterial();

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    material
);
sphere.position.x = -3.5
scene.add(sphere)

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    material
);
scene.add(cube)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.2, 32, 100),
    material
);
torus.position.x = 3.5
scene.add(torus)

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
);
plane.position.y = -0.65
plane.rotation.x = - Math.PI * 0.5
scene.add(plane)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
scene.add(ambientLight)
gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001).name('Ambient Light Intensity')

const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.3)
directionalLight.position.set(1, 0.25, 0)
scene.add(directionalLight)

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)
scene.add(directionalLightHelper)

const hemosphericLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3)
scene.add(hemosphericLight)

const hemosphericLightHelper = new THREE.HemisphereLightHelper(hemosphericLight, 0.2)
scene.add(hemosphericLightHelper)

const pointLight = new THREE.PointLight(0xff9000, 0.5, 10, 2)
pointLight.position.set(1, -0.5, 1)
scene.add(pointLight)

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2)
scene.add(pointLightHelper)

const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1)
rectAreaLight.position.set(-1.5, 0, 1.5)
rectAreaLight.lookAt(new THREE.Vector3())
scene.add(rectAreaLight)

const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight)
scene.add(rectAreaLightHelper)

const spotLight = new THREE.SpotLight(0x78ff00, 0.5, 10, Math.PI * 0.1, 0.25, 1)
spotLight.position.set(0, 2, 3)
scene.add(spotLight)
spotLight.target.position.x = -0.75
scene.add(spotLight.target)

const spotLightHelper = new THREE.SpotLightHelper(spotLight)
scene.add(spotLightHelper)

const sizes = {
    width : window.innerWidth,
    height: window.innerHeight 
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    renderer.setSize(sizes.width, sizes.height)
})

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 5)
scene.add(camera);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(sizes.width, sizes.height);
document.body.appendChild(renderer.domElement);

function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    camera.rotation.y += 10;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}
animate()