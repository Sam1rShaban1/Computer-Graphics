// Ground System - Flat horizontal ground with grass texture
import * as THREE from 'three';

export class GroundSystem {
    constructor(scene) {
        this.scene = scene;
        this.ground = null;
    }
    
    createGround() {
        // Ground plane sized for campus - 600x600 units
        const geometry = new THREE.PlaneGeometry(600, 600, 200, 200);
        
        // Load grass texture with proper loading
        const textureLoader = new THREE.TextureLoader();
        const grassTexture = textureLoader.load('/textures/grass.jpg');
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(400, 400);
        
        const material = new THREE.MeshStandardMaterial({
            map: grassTexture,
            color: 0xffffff,
            roughness: 0.9,
            metalness: 0.0
        });
        
        this.ground = new THREE.Mesh(geometry, material);
        // Ground plane centered at origin, rotated to be horizontal
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.set(0, 0, 0);
        this.ground.receiveShadow = true;
        this.ground.castShadow = false;
        
        return this.ground;
    }
    
    update(camera) {
        // Simple update - no procedural effects needed
    }
    
    dispose() {
        if (this.ground) {
            this.ground.geometry.dispose();
            if (this.ground.material.map) {
                this.ground.material.map.dispose();
            }
            this.ground.material.dispose();
        }
    }
}
