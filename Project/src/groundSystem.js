// Ground System - Flat horizontal ground with grass texture
import * as THREE from 'three';

export class GroundSystem {
    constructor(scene) {
        this.scene = scene;
        this.ground = null;
    }
    
    createGround() {
        // Large flat ground plane - 2000x2000 units with very high detail
        const geometry = new THREE.PlaneGeometry(2000, 2000, 200, 200);
        
        // Load grass texture with proper loading
        const textureLoader = new THREE.TextureLoader();
        const grassTexture = textureLoader.load('/textures/grass.jpg');
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(100, 100);
        
        const material = new THREE.MeshStandardMaterial({
            map: grassTexture,
            color: 0xffffff,
            roughness: 0.9,
            metalness: 0.0
        });
        
        this.ground = new THREE.Mesh(geometry, material);
        // No rotation - let plane lie flat in XY plane with Z up
        this.ground.position.set(0, 0, 0);
        this.ground.receiveShadow = true;
        this.ground.castShadow = false;
        
        console.log('Ground created with grass texture:', grassTexture.image ? 'SUCCESS' : 'FAILED');
        
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
