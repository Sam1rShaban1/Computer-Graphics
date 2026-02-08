import * as THREE from 'three';
import { BUILDING_TIMELINE, BUILDING_INFO } from './buildingData.js';
import { DustParticles } from './dustParticles.js';

export class BuildingAnimator {
  constructor(scene, camera, controls) {
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.buildingMeshes = new Map(); // buildingName -> mesh[]
    this.animationQueue = [];
    this.isAnimating = false;
    
    this.dustParticles = new DustParticles(scene);
    this.lastCameraReturnTime = 0;
    this.originalCameraPosition = null;
    this.originalCameraTarget = null;
    
    this.setupReturnTimer();
  }

  setupReturnTimer() {
    // Store original camera position
    this.originalCameraPosition = this.camera.position.clone();
    this.originalCameraTarget = this.controls.target.clone();
  }

  registerBuilding(name, mesh) {
    if (!this.buildingMeshes.has(name)) {
      this.buildingMeshes.set(name, []);
    }
    this.buildingMeshes.get(name).push(mesh);
    
    // Initially hide all buildings
    mesh.visible = false;
    mesh.scale.set(0, 0, 0);
  }

  showBuildingsUpToYear(year, animate = true) {
    const buildingsToShow = [];
    
    // Collect all buildings that should be visible
    for (const [buildYear, buildingNames] of Object.entries(BUILDING_TIMELINE)) {
      if (parseInt(buildYear) <= year) {
        buildingsToShow.push(...buildingNames);
      }
    }

    // Hide buildings beyond current year
    for (const [name, meshes] of this.buildingMeshes) {
      if (!buildingsToShow.includes(name)) {
        meshes.forEach(mesh => {
          mesh.visible = false;
          mesh.scale.set(0, 0, 0);
        });
      }
    }

    if (animate) {
      this.animateBuildings(buildingsToShow, year);
    } else {
      // Instant visibility (for jumping)
      buildingsToShow.forEach(name => {
        const meshes = this.buildingMeshes.get(name);
        if (meshes) {
          meshes.forEach(mesh => {
            mesh.visible = true;
            mesh.scale.set(1, 1, 1);
          });
        }
      });
    }
  }

  animateBuildings(buildingNames, year) {
    // Create animation queue for this year's buildings
    this.animationQueue = [];
    
    buildingNames.forEach((name, index) => {
      const meshes = this.buildingMeshes.get(name);
      if (meshes) {
        meshes.forEach(mesh => {
          this.animationQueue.push({
            mesh,
            buildingName: name,
            year,
            delay: index * 1000, // 1 second between buildings
            startTime: null,
            duration: 2000, // 2 seconds animation
            startPos: mesh.position.clone(),
            endPos: mesh.position.clone()
          });
        });
      }
    });

    this.isAnimating = true;
    this.processAnimationQueue();
  }

  processAnimationQueue() {
    if (!this.isAnimating || this.animationQueue.length === 0) {
      this.isAnimating = false;
      return;
    }

    const currentTime = Date.now();
    
    for (let i = this.animationQueue.length - 1; i >= 0; i--) {
      const anim = this.animationQueue[i];
      
      if (!anim.startTime) {
        // Check if it's time to start this animation
        if (anim.delay <= 0) {
          anim.startTime = currentTime;
          this.startBuildingAnimation(anim);
        } else {
          anim.delay -= 16; // Approximate frame time
        }
        continue;
      }

      const elapsed = currentTime - anim.startTime;
      const progress = Math.min(elapsed / anim.duration, 1);
      
      if (progress >= 1) {
        // Animation complete
        this.animationQueue.splice(i, 1);
      } else {
        // Update animation
        this.updateBuildingAnimation(anim, progress);
      }
    }

    requestAnimationFrame(() => this.processAnimationQueue());
  }

  startBuildingAnimation(anim) {
    // Make building visible and start animation
    anim.mesh.visible = true;
    
    // Calculate building height from geometry
    const geometry = anim.mesh.geometry;
    geometry.computeBoundingBox();
    const buildingHeight = geometry.boundingBox.max.z - geometry.boundingBox.min.z;
    
    // Store original position and set starting position below ground
    // With campusGroup rotated, Z points "up" in world space
    anim.startPos = anim.endPos.clone();
    anim.startPos.z = -buildingHeight; // Start below ground
    anim.mesh.position.copy(anim.startPos);
    anim.mesh.scale.set(0, 0, 0);
    
    // Create dust cloud at building base (in world coordinates)
    this.dustParticles.createCloud({
      x: anim.endPos.x,
      y: anim.endPos.y,
      z: 0.5 // Slightly above ground
    }, 15);
    
    // Focus camera on this building
    this.focusCameraOnBuilding(anim.mesh);
  }

  updateBuildingAnimation(anim, progress) {
    // Smooth easing
    const easeProgress = this.easeOutBack(progress);
    
    // Animate scale from 0 to 1
    const scale = easeProgress;
    anim.mesh.scale.set(scale, scale, scale);
    
    // Animate position from below ground to final position
    const totalHeight = Math.abs(anim.startPos.z - anim.endPos.z);
    const currentHeight = totalHeight * easeProgress;
    anim.mesh.position.z = anim.startPos.z + currentHeight;
    
    // Add slight wobble for realistic settling effect
    if (progress < 0.5) {
      anim.mesh.rotation.x = Math.sin(progress * Math.PI * 2) * 0.05 * (1 - progress * 2);
    }
  }

  easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  focusCameraOnBuilding(mesh) {
    // Get building bounding box in world space
    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Calculate distance based on building size
    const maxDim = Math.max(Math.abs(size.x), Math.abs(size.y));
    const distance = Math.max(maxDim * 3, 50);
    
    // Position camera above and in front of building
    const targetPosition = new THREE.Vector3(
      center.x,
      center.y - distance,
      center.z + distance * 0.6
    );
    
    // Smooth camera transition
    this.animateCameraTo(targetPosition, center);
    
    // Store return time
    this.lastCameraReturnTime = Date.now();
  }

  animateCameraTo(position, target, duration = 3000) {
    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const startTime = Date.now();
    
    const animateCamera = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = this.easeInOutCubic(progress);
      
      this.camera.position.lerpVectors(startPos, position, easeProgress);
      this.controls.target.lerpVectors(startTarget, target, easeProgress);
      this.controls.update();
      
      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      }
    };
    
    animateCamera();
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  resetCameraToOverview() {
    // Return to full campus view
    this.animateCameraTo(
      new THREE.Vector3(0, -300, 200), // Overview position
      new THREE.Vector3(0, 0, 0),      // Look at center
      2000
    );
  }

  update(deltaTime) {
    // Update dust particles
    this.dustParticles.update(deltaTime);
    
    // Check if we should return to overview camera
    if (this.lastCameraReturnTime > 0) {
      const timeSinceFocus = Date.now() - this.lastCameraReturnTime;
      if (timeSinceFocus > 5000) { // 5 seconds
        this.resetCameraToOverview();
        this.lastCameraReturnTime = 0;
      }
    }
  }

  getBuildingInfo(buildingName) {
    const year = Object.entries(BUILDING_TIMELINE).find(([year, buildings]) => 
      buildings.includes(buildingName)
    )?.[0];
    
    return {
      ...BUILDING_INFO[buildingName],
      year: year ? parseInt(year) : 2026,
      name: buildingName.replace(/_/g, ' ')
    };
  }

  dispose() {
    this.dustParticles.dispose();
    this.buildingMeshes.clear();
    this.animationQueue = [];
    this.isAnimating = false;
  }
}