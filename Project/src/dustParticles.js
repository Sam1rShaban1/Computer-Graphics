import * as THREE from 'three';

export class DustParticles {
  constructor(scene) {
    this.scene = scene;
    this.particleSystems = [];
    
    // Simple particle geometry (square)
    this.particleGeometry = new THREE.PlaneGeometry(0.5, 0.5);
    
    // Particle material (brown/grey colors)
    this.particleMaterial = new THREE.MeshBasicMaterial({
      color: 0x8B7355,
      transparent: true,
      side: THREE.DoubleSide
    });
  }

  createCloud(position, count = 25) {
    const particles = [];
    const system = {
      particles: [],
      life: 1.5, // 1.5 seconds
      startTime: Date.now()
    };

    for (let i = 0; i < count; i++) {
      const particle = new THREE.Mesh(this.particleGeometry, this.particleMaterial.clone());
      
      // Random position around building base
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const radius = Math.random() * 3 + 1;
      
      // Position in local space (Z is up)
      particle.position.set(
        position.x + Math.cos(angle) * radius,
        position.y + Math.sin(angle) * radius,
        position.z + Math.random() * 2 // Start slightly above ground
      );
      
      // Random initial velocity (upward and outward)
      particle.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 1,
        (Math.random() - 0.5) * 1,
        Math.random() * 2 + 1 // Upward velocity
      );
      
      // Random rotation
      particle.rotation.z = Math.random() * Math.PI;
      particle.rotationSpeed = (Math.random() - 0.5) * 0.1;
      
      // Random size
      const scale = Math.random() * 0.8 + 0.2;
      particle.scale.set(scale, scale, 1);
      
      this.scene.add(particle);
      particles.push(particle);
    }

    system.particles = particles;
    this.particleSystems.push(system);
    
    return system;
  }

  update(deltaTime) {
    const currentTime = Date.now();
    
    // Update and remove old particle systems
    for (let i = this.particleSystems.length - 1; i >= 0; i--) {
      const system = this.particleSystems[i];
      const age = (currentTime - system.startTime) / 1000;
      
      if (age > system.life) {
        // Remove old particle system
        system.particles.forEach(particle => {
          this.scene.remove(particle);
          particle.material.dispose();
        });
        this.particleSystems.splice(i, 1);
        continue;
      }
      
      // Update particles in this system
      const opacity = Math.max(0, 1 - (age / system.life));
      const lifeProgress = age / system.life;
      
      system.particles.forEach(particle => {
        // Apply velocity with gravity (Z is up)
        particle.velocity.z -= deltaTime * 9.8; // Gravity
        particle.position.x += particle.velocity.x * deltaTime;
        particle.position.y += particle.velocity.y * deltaTime;
        particle.position.z += particle.velocity.z * deltaTime;
        
        // Apply drag
        particle.velocity.multiplyScalar(0.98);
        
        // Rotate particle
        particle.rotation.x += particle.rotationSpeed;
        
        // Fade out
        particle.material.opacity = opacity;
        
        // Grow slightly over time
        particle.scale.setScalar((1 + lifeProgress * 0.5) * particle.scale.x);
      });
    }
  }

  dispose() {
    this.particleSystems.forEach(system => {
      system.particles.forEach(particle => {
        this.scene.remove(particle);
        particle.material.dispose();
      });
    });
    this.particleSystems = [];
    this.particleGeometry.dispose();
    this.particleMaterial.dispose();
  }
}