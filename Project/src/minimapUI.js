// Minimap UI - Real-time radar-style campus overview
import * as THREE from 'three';

export class MinimapUI {
    constructor(camera) {
        this.camera = camera;
        this.element = null;
        this.canvas = null;
        this.ctx = null;
        this.buildings = [];
        this.size = 200;
        this.position = { x: 20, y: 20 };
        this.scale = 0.1;
        
        this.createUI();
    }
    
    createUI() {
        // Create container
        this.element = document.createElement('div');
        this.element.style.cssText = `
            position: fixed;
            bottom: ${this.position.y}px;
            left: ${this.position.x}px;
            width: ${this.size}px;
            height: ${this.size}px;
            background: rgba(0, 20, 40, 0.8);
            border: 2px solid rgba(100, 200, 255, 0.5);
            border-radius: 50%;
            overflow: hidden;
            z-index: 1000;
            box-shadow: 0 0 20px rgba(0, 100, 200, 0.3);
        `;
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.ctx = this.canvas.getContext('2d');
        
        this.element.appendChild(this.canvas);
        document.body.appendChild(this.element);
        
        // Add title
        const title = document.createElement('div');
        title.style.cssText = `
            position: absolute;
            bottom: ${this.size + 10}px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-family: 'Segoe UI', sans-serif;
            font-size: 12px;
            text-shadow: 0 0 10px rgba(100, 200, 255, 0.8);
        `;
        title.textContent = 'Campus Map';
        this.element.appendChild(title);
    }
    
    addBuilding(mesh, name) {
        const box = new THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        this.buildings.push({
            mesh,
            name,
            center: center.clone(),
            size: size.clone(),
            visible: true
        });
    }
    
    update() {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        const center = this.size / 2;
        
        // Clear canvas
        ctx.clearRect(0, 0, this.size, this.size);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= this.size; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, this.size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(this.size, i);
            ctx.stroke();
        }
        
        // Draw buildings
        this.buildings.forEach(building => {
            if (!building.visible) return;
            
            // Project building position to minimap
            const x = center + (building.center.x - this.camera.position.x) * this.scale;
            const y = center + (building.center.y - this.camera.position.y) * this.scale;
            
            // Determine color based on building type
            let color = '#4a90d9';
            if (building.name.includes('dorm')) color = '#d94a4a';
            else if (building.name.includes('library')) color = '#d9a54a';
            else if (building.name.includes('cantine')) color = '#4ad98c';
            
            // Draw building marker
            const size = Math.max(3, Math.min(10, building.size.x * this.scale));
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
        
        // Draw camera indicator
        const camX = center + (-this.camera.position.x) * this.scale;
        const camY = center + (-this.camera.position.y) * this.scale;
        
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(camX, camY, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw view direction
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(camX, camY);
        ctx.lineTo(
            camX + dir.x * 20,
            camY + dir.y * 20
        );
        ctx.stroke();
        
        // Draw compass
        ctx.fillStyle = 'white';
        ctx.font = '10px sans-serif';
        ctx.fillText('N', center - 3, 15);
    }
    
    resize() {
        // Handle resize if needed
    }
    
    dispose() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
