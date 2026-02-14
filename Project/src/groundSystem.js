// Ground System - Flat horizontal ground with grass texture
import * as THREE from 'three';

export class GroundSystem {
    constructor(scene) {
        this.scene = scene;
        this.ground = null;
    }
    
    createGround() {
        // Ground plane sized for campus - 1200x1200 units
        const geometry = new THREE.PlaneGeometry(1200, 1200, 1, 1); // No subdivisions needed
        
        // Load grass texture with proper loading
        const textureLoader = new THREE.TextureLoader();
        const grassTexture = textureLoader.load('/textures/grass.jpg');
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(75, 75); // Reduced from 400 for performance
        grassTexture.anisotropy = 8; // Reduced from 16
        grassTexture.colorSpace = THREE.SRGBColorSpace;
        
        const material = new THREE.MeshStandardMaterial({
            map: grassTexture,
            color: 0xffffff,
            roughness: 0.9,
            metalness: 0.0
        });
        
        this.ground = new THREE.Mesh(geometry, material);
        // No rotation - PlaneGeometry already horizontal in XY plane for Z-up system
        this.ground.position.set(0, 300, 0);
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
