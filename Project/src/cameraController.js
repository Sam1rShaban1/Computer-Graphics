// Camera Controller - Smooth camera movements and cinematic transitions
import * as THREE from 'three';

export class CameraController {
    constructor(camera, controls) {
        this.camera = camera;
        this.controls = controls;
        this.isAutoPlay = false;
        this.isTransitioning = false;
        this.targetPosition = new THREE.Vector3();
        this.targetLookAt = new THREE.Vector3();
        this.transitionDuration = 2000;
        this.transitionStartTime = 0;
        this.startPosition = new THREE.Vector3();
        this.startLookAt = new THREE.Vector3();
        
        // Preset viewpoints (Z is up in this project)
        this.presets = {
            overview: {
                position: new THREE.Vector3(200, -200, 100),
                lookAt: new THREE.Vector3(0, 300, 0)
            },
            aerial: {
                position: new THREE.Vector3(0, -500, 200),
                lookAt: new THREE.Vector3(0, 300, 0)
            },
            entrance: {
                position: new THREE.Vector3(100, 50, 30),
                lookAt: new THREE.Vector3(0, 300, 0)
            },
            library: {
                position: new THREE.Vector3(50, -100, 40),
                lookAt: new THREE.Vector3(-50, 400, 0)
            }
        };
        
        // Save initial state
        this.initialPosition = camera.position.clone();
        this.initialLookAt = controls.target.clone();
    }
    
    setAutoPlay(isPlaying) {
        this.isAutoPlay = isPlaying;
    }
    
    focusOnBuilding(mesh) {
        // Get building position
        const box = new THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Calculate camera position near building
        const distance = Math.max(size.x, size.y) * 3 + 50;
        const position = new THREE.Vector3(
            center.x + distance * 0.5,
            center.y + distance * 0.3,
            center.z + distance * 0.8
        );
        
        this.transitionTo(position, center);
    }
    
    transitionTo(position, lookAt, duration = 2000) {
        if (this.isTransitioning) return;
        
        this.startPosition.copy(this.camera.position);
        this.startLookAt.copy(this.controls.target);
        this.targetPosition.copy(position);
        this.targetLookAt.copy(lookAt);
        this.transitionDuration = duration;
        this.transitionStartTime = Date.now();
        this.isTransitioning = true;
    }
    
    goToPreset(presetName, duration = 3000) {
        const preset = this.presets[presetName];
        if (preset) {
            this.transitionTo(preset.position.clone(), preset.lookAt.clone(), duration);
        }
    }
    
    resetToInitial(duration = 2000) {
        this.transitionTo(
            this.initialPosition.clone(),
            this.initialLookAt.clone(),
            duration
        );
    }
    
    update(deltaTime) {
        if (!this.isTransitioning) return;
        
        const elapsed = Date.now() - this.transitionStartTime;
        const progress = Math.min(elapsed / this.transitionDuration, 1);
        
        // Easing function
        const easeProgress = this.easeInOutCubic(progress);
        
        // Interpolate position
        this.camera.position.lerpVectors(this.startPosition, this.targetPosition, easeProgress);
        
        // Interpolate target
        this.controls.target.lerpVectors(this.startLookAt, this.targetLookAt, easeProgress);
        this.controls.update();
        
        // Check if transition complete
        if (progress >= 1) {
            this.isTransitioning = false;
        }
    }
    
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    dispose() {
        // Cleanup if needed
    }
}
