// Dynamic Lighting System - Sun, moon, and atmospheric effects
import * as THREE from 'three';

export class DynamicLighting {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.sun = null;
        this.moon = null;
        this.hemiLight = null;
    }
    
    setup() {
        // Hemisphere light - sky blue to ground brown-green (brighter)
        this.hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x5a4a32, 0.9);
        this.scene.add(this.hemiLight);
        
        // Main sun light (brighter)
        this.sun = new THREE.DirectionalLight(0xfffaf0, 2.0);
        this.sun.castShadow = true;
        this.sun.shadow.mapSize.width = 2048;
        this.sun.shadow.mapSize.height = 2048;
        this.sun.shadow.camera.near = 1;
        this.sun.shadow.camera.far = 600;
        
        // Tight shadow frustum for better quality
        const shadowSize = 200;
        this.sun.shadow.camera.left = -shadowSize;
        this.sun.shadow.camera.right = shadowSize;
        this.sun.shadow.camera.top = shadowSize;
        this.sun.shadow.camera.bottom = -shadowSize;
        
        // Shadow bias to prevent artifacts
        this.sun.shadow.bias = -0.0003;
        this.sun.shadow.normalBias = 0.02;
        
        // Enable shadow radius for softer shadows
        this.sun.shadow.radius = 1;
        
        this.scene.add(this.sun);
        
        // Subtle moon light
        this.moon = new THREE.DirectionalLight(0x8888aa, 0.1);
        this.moon.position.set(-100, 100, -50);
        this.scene.add(this.moon);
        
        this.updateTime();
        return {
            sun: this.sun,
            moon: this.moon,
            hemiLight: this.hemiLight
        };
    }
    
    setYear(year) {
        // Could add year-specific lighting variations here
    }
    
    update(deltaTime) {
        this.updateTime();
    }
    
    updateTime() {
        // Fixed sun position - high and bright
        this.sun.position.set(150, 200, 100);
        this.sun.intensity = 1.5;
        
        // Subtle moon
        this.moon.intensity = 0.05;
        
        // Hemisphere - balanced ambient
        this.hemiLight.intensity = 0.6;
        this.hemiLight.color.setHex(0x87CEEB);
        this.hemiLight.groundColor.setHex(0x5a4a32);
        
        // Update sun target
        this.sun.target.position.set(0, 300, 0);
        this.sun.target.updateMatrixWorld();
    }
    
    dispose() {
        if (this.sun) this.sun.dispose();
        if (this.moon) this.moon.dispose();
        if (this.hemiLight) this.hemiLight.dispose();
    }
}
