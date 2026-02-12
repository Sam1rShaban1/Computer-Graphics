// Dynamic Lighting System - Sun, moon, and atmospheric effects
import * as THREE from 'three';

let renderer = null;
export function setRenderer(r) {
    renderer = r;
}

export class DynamicLighting {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.sun = null;
        this.moon = null;
        this.hemiLight = null;
        this.currentYear = 2001;
        this.timeOfDay = 0.25; // Fixed to morning (bright daytime)
        this.dayDuration = 120000; // Much slower cycle
    }
    
    setup() {
        // Basic ambient light - simple and bright
        this.hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x3a2f27, 1.0);
        this.scene.add(this.hemiLight);
        
        // Strong sun light
        this.sun = new THREE.DirectionalLight(0xffffff, 1.2);
        this.sun.castShadow = true;
        this.sun.shadow.mapSize.width = 2048;
        this.sun.shadow.mapSize.height = 2048;
        this.sun.shadow.camera.near = 10;
        this.sun.shadow.camera.far = 1000;
        this.sun.shadow.camera.left = -300;
        this.sun.shadow.camera.right = 300;
        this.sun.shadow.camera.top = 300;
        this.sun.shadow.camera.bottom = -300;
        this.scene.add(this.sun);
        
        // Moon light - reduced
        this.moon = new THREE.DirectionalLight(0x6666ff, 0.05);
        this.moon.position.set(-100, 100, -50);
        this.scene.add(this.moon);
        
        // Update initial state
        this.updateTime();
        return {
            sun: this.sun,
            moon: this.moon,
            hemiLight: this.hemiLight
        };
    }
    
    setYear(year) {
        this.currentYear = year;
    }
    
    update(deltaTime) {
        // Very slow time progression - mostly fixed daytime
        // this.timeOfDay = (this.timeOfDay + deltaTime * 1000 / this.dayDuration) % 1;
        this.updateTime();
    }
    
    updateTime() {
        // Fixed bright daytime - no time cycling
        const sunHeight = 0.8; // Fixed high sun position
        
        // Sun position - bright and high
        this.sun.position.set(100, 100, 200);
        this.sun.color.setHex(0xffffff);
        this.sun.intensity = 1.2;
        
        // Moon - minimal
        this.moon.intensity = 0.01;
        
        // Hemisphere light - bright
        this.hemiLight.intensity = 1.0;
        this.hemiLight.color.setHex(0x87CEEB);
        this.hemiLight.groundColor.setHex(0x4a7c23);
        
        // Sky color - bright blue
        if (renderer) renderer.setClearColor(0x87CEEB, 1);
        
        // Update sun target
        this.sun.target.position.set(0, 0, 0);
        this.sun.target.updateMatrixWorld();
    }
    
    setAutoPlay(isPlaying) {
        if (isPlaying) {
            // Speed up time during animation
            this.dayDuration = 10000; // 10 seconds per day
        } else {
            // Normal time when paused
            this.dayDuration = 60000; // 60 seconds per day
        }
    }
    
    dispose() {
        if (this.sun) this.sun.dispose();
        if (this.moon) this.moon.dispose();
        if (this.hemiLight) this.hemiLight.dispose();
    }
}
