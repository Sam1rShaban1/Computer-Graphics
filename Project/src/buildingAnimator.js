import * as THREE from 'three';
import { BUILDING_TIMELINE, BUILDING_INFO } from './buildingData.js';

export class BuildingAnimator {
  constructor(scene) {
    this.scene = scene;
    this.buildingMeshes = new Map();
    this.animationQueue = [];
    this.isAnimating = false;
    this.isPaused = false;
  }

  setPaused(paused) {
    this.isPaused = paused;
    if (paused) {
      console.log('Building animator paused');
    } else {
      console.log('Building animator resumed');
    }
  }

  registerBuilding(name, mesh) {
    if (!this.buildingMeshes.has(name)) {
      this.buildingMeshes.set(name, []);
    }
    this.buildingMeshes.get(name).push(mesh);
    
    mesh.visible = false;
    mesh.scale.set(0, 0, 0);
  }

  showBuildingsUpToYear(year, animate = true) {
    const buildingsToShow = [];
    
    for (const [buildYear, buildingNames] of Object.entries(BUILDING_TIMELINE)) {
      if (parseInt(buildYear) <= year) {
        buildingsToShow.push(...buildingNames);
      }
    }

    const newBuildings = [];
    const visibleBuildings = [];
    
    for (const [name, meshes] of this.buildingMeshes) {
      if (buildingsToShow.includes(name)) {
        visibleBuildings.push(name);
        
        const isAlreadyVisible = meshes.some(mesh => mesh.visible && mesh.scale.x > 0.9);
        if (!isAlreadyVisible) {
          newBuildings.push(name);
        }
      } else {
        meshes.forEach(mesh => {
          mesh.visible = false;
          mesh.scale.set(0, 0, 0);
        });
      }
    }

    if (animate && newBuildings.length > 0) {
      this.animateBuildings(newBuildings, year);
    } else if (!animate) {
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
    // Calculate offset for staggered timing - append to existing queue
    let queueOffset = 0;
    if (this.animationQueue.length > 0) {
      const maxDelay = Math.max(...this.animationQueue.map(a => a.delay));
      const maxDuration = Math.max(...this.animationQueue.map(a => a.duration));
      queueOffset = maxDelay + maxDuration;
    }
    
    buildingNames.forEach((name, index) => {
      const meshes = this.buildingMeshes.get(name);
      if (meshes) {
        meshes.forEach(mesh => {
          // Skip if already in queue
          if (this.animationQueue.some(a => a.mesh === mesh)) return;
          
          // Calculate building height
          mesh.geometry.computeBoundingBox();
          const buildingHeight = mesh.geometry.boundingBox.max.z - mesh.geometry.boundingBox.min.z;
          
          this.animationQueue.push({
            mesh,
            buildingName: name,
            year,
            delay: queueOffset + index * 1000,
            startTime: null,
            duration: 2000,
            buildingHeight
          });
        });
      }
    });

    this.isAnimating = true;
  }

  update(deltaTime) {
    if (!this.isAnimating) return;

    for (let i = this.animationQueue.length - 1; i >= 0; i--) {
      const anim = this.animationQueue[i];

      if (!anim.startTime) {
        if (this.isPaused) continue;

        anim.delay -= deltaTime * 1000;
        if (anim.delay <= 0) {
          anim.startTime = Date.now();
          this.startBuildingAnimation(anim);
        }
        continue;
      }

      const elapsed = Date.now() - anim.startTime;
      const progress = Math.min(elapsed / anim.duration, 1);

      if (progress >= 1) {
        anim.mesh.scale.set(1, 1, 1);
        anim.mesh.position.z = 0;
        anim.mesh.rotation.x = 0;
        this.animationQueue.splice(i, 1);
      } else {
        const easeProgress = this.easeOutBack(progress);
        const scale = easeProgress;
        anim.mesh.scale.set(scale, scale, scale);

        const currentHeight = anim.buildingHeight * easeProgress;
        anim.mesh.position.z = -anim.buildingHeight + currentHeight;

        if (progress < 0.5) {
          anim.mesh.rotation.x = Math.sin(progress * Math.PI * 2) * 0.05 * (1 - progress * 2);
        }
      }
    }

    if (this.animationQueue.length === 0) {
      this.isAnimating = false;
    }
  }

  startBuildingAnimation(anim) {
    anim.mesh.visible = true;
    
    anim.mesh.scale.set(0, 0, 0);
    anim.mesh.position.z = -anim.buildingHeight;
    anim.mesh.rotation.x = 0;
  }

  easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
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
