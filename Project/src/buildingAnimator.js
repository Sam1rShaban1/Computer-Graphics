import * as THREE from 'three';
import { BUILDING_TIMELINE, BUILDING_INFO } from './buildingData.js';

export class BuildingAnimator {
  constructor(scene, camera, controls) {
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.buildingMeshes = new Map(); // buildingName -> mesh[]
    this.animationQueue = [];
    this.isAnimating = false;
    this.isPaused = false; // Pause state
  }

  setPaused(paused) {
    this.isPaused = paused;
    if (paused) {
      // When paused, complete current building animation but don't start new ones
      console.log('Building animator paused');
    } else {
      console.log('Building animator resumed');
      // Resume processing queue if there are pending animations
      if (this.animationQueue.length > 0 && !this.isAnimating) {
        this.processAnimationQueue();
      }
    }
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

    // Track which buildings are NEW (weren't visible before)
    const newBuildings = [];
    const visibleBuildings = [];
    
    for (const [name, meshes] of this.buildingMeshes) {
      if (buildingsToShow.includes(name)) {
        // Building should be visible
        visibleBuildings.push(name);
        
        // Check if it's already visible
        const isAlreadyVisible = meshes.some(mesh => mesh.visible && mesh.scale.x > 0.9);
        if (!isAlreadyVisible) {
          newBuildings.push(name);
        }
      } else {
        // Hide buildings beyond current year
        meshes.forEach(mesh => {
          mesh.visible = false;
          mesh.scale.set(0, 0, 0);
        });
      }
    }

    if (animate) {
      // Only animate NEW buildings, keep already-visible ones as they are
      this.animateBuildings(newBuildings, year);
    } else {
      // Instant visibility (for jumping)
      visibleBuildings.forEach(name => {
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

    // If paused, don't start new building animations
    // But continue processing current animations
    const currentTime = Date.now();
    
    for (let i = this.animationQueue.length - 1; i >= 0; i--) {
      const anim = this.animationQueue[i];
      
      // If paused and animation hasn't started yet, skip it
      if (!anim.startTime && this.isPaused) {
        continue;
      }
      
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
    this.buildingMeshes.clear();
    this.animationQueue = [];
    this.isAnimating = false;
  }
}