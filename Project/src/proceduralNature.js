// Procedural Nature System - Trees, vegetation, and ecosystem
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class ProceduralNature {
    constructor(scene) {
        this.scene = scene;
        this.trees = null;
        this.bushes = null;
        this.treeModel = null;
        this.gltfLoader = new GLTFLoader();
    }
    
    async createForest() {
        console.log('Starting tree loading...');
        try {
            // Load the main tree model
            console.log('Loading tree model from /models/uploads_files_6756133_Tree+.glb');
            const gltf = await this.gltfLoader.loadAsync('/models/uploads_files_6756133_Tree+.glb');
            const treeModel = gltf.scene;
            console.log('GLTF loaded successfully, scene children:', treeModel.children.length);
            
            // Create instanced trees using model
            const treeMaterial = new THREE.MeshStandardMaterial({
                color: 0x228B22,
                roughness: 0.8,
                metalness: 0.1
            });
            
            // Extract mesh from loaded model
            let treeMesh = null;
            let meshCount = 0;
            treeModel.traverse((child) => {
                if (child.isMesh) {
                    meshCount++;
                    treeMesh = child;
                    treeMesh.material = treeMaterial;
                    console.log('Found mesh #' + meshCount + ':', child.name, '- Geometry:', child.geometry ? 'YES' : 'NO');
                }
            });
            
            console.log('Total meshes found:', meshCount);
            
            if (!treeMesh) {
                console.warn('No mesh found in tree model, using fallback');
                return this.createFallbackTrees();
            }
            
            console.log('Creating instanced mesh with tree geometry...');
            
            // Create geometry from tree mesh
            const treeGeometry = treeMesh.geometry.clone();
            console.log('Tree geometry vertices:', treeGeometry.attributes.position.count);
            
            // Rotate geometry to align with Z-up coordinate system
            // This makes trees point upward instead of lying flat
            treeGeometry.rotateX(Math.PI / 2);
            
            // Scale down the tree model geometry for better proportions
            treeGeometry.scale(0.3, 0.3, 0.3);
            
            const treeCount = 1500;
            this.trees = new THREE.InstancedMesh(treeGeometry, treeMaterial, treeCount);
            this.trees.castShadow = true;
            this.trees.receiveShadow = true;
            
            console.log('InstancedMesh created, positioning trees...');
            
            const dummy = new THREE.Object3D();
            
            // Building exclusion zones (based on building locations)
            const buildingZones = [
                { x: 100, y: 50, radius: 150 },   // Building 303 area
                { x: -50, y: 100, radius: 120 },  // Library area
                { x: 50, y: -50, radius: 100 },   // Academic buildings
                { x: 150, y: 100, radius: 80 },   // Dormitories
                { x: 0, y: 0, radius: 200 },      // Central campus
            ];
            
            function isNearBuilding(x, y) {
                for (const zone of buildingZones) {
                    const dist = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
                    if (dist < zone.radius) return true;
                }
                return false;
            }
            
            let placedCount = 0;
            let attemptCount = 0;
            const maxAttempts = treeCount * 10;
            
            while (placedCount < treeCount && attemptCount < maxAttempts) {
                attemptCount++;
                
                const x = (Math.random() - 0.5) * 1400;
                const y = (Math.random() - 0.5) * 1400;
                
                // Keep trees away from buildings and infrastructure
                if (isNearBuilding(x, y)) continue;
                if (Math.sqrt(x * x + y * y) < 100) continue;
                
                const z = 0;
                const scale = 1.0 + Math.random() * 1.5;
                
                dummy.position.set(x, y, z);
                dummy.scale.set(scale, scale, scale);
                dummy.rotation.z = Math.random() * Math.PI * 2;
                dummy.updateMatrix();
                
                this.trees.setMatrixAt(placedCount, dummy.matrix);
                placedCount++;
            }
            
            console.log('Trees placed:', placedCount, 'of', treeCount, '(attempts:', attemptCount + ')');
            
            this.trees.instanceMatrix.needsUpdate = true;
            console.log('Trees positioned, adding to scene...');
            
            const group = new THREE.Group();
            group.add(this.trees);
            console.log('Tree group ready, returning...');
            
            return group;
            
        } catch (error) {
            console.warn('Failed to load tree model, using fallback:', error.message);
            console.log('Creating fallback cone trees...');
            return this.createFallbackTrees();
        }
    }
    
    createFallbackTrees() {
        console.log('Creating fallback cone trees...');
        const treeGeometry = new THREE.ConeGeometry(2, 6, 8);
        // Rotate to point up in Z-up coordinate system
        treeGeometry.rotateX(Math.PI / 2);
        const treeMaterial = new THREE.MeshStandardMaterial({
            color: 0x228B22,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const treeCount = 500;
        this.trees = new THREE.InstancedMesh(treeGeometry, treeMaterial, treeCount);
        this.trees.castShadow = true;
        this.trees.receiveShadow = true;
        
        const dummy = new THREE.Object3D();
        
        // Building exclusion zones
        const buildingZones = [
            { x: 100, y: 50, radius: 150 },
            { x: -50, y: 100, radius: 120 },
            { x: 50, y: -50, radius: 100 },
            { x: 150, y: 100, radius: 80 },
            { x: 0, y: 0, radius: 200 },
        ];
        
        function isNearBuilding(x, y) {
            for (const zone of buildingZones) {
                const dist = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
                if (dist < zone.radius) return true;
            }
            return false;
        }
        
        let placedCount = 0;
        let attemptCount = 0;
        const maxAttempts = treeCount * 10;
        
        while (placedCount < treeCount && attemptCount < maxAttempts) {
            attemptCount++;
            
            const x = (Math.random() - 0.5) * 1200;
            const y = (Math.random() - 0.5) * 1200;
            
            if (isNearBuilding(x, y)) continue;
            if (Math.sqrt(x * x + y * y) < 100) continue;
            
            const z = 3;
            const scale = 0.5 + Math.random() * 1.0;
            
            dummy.position.set(x, y, z);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.z = Math.random() * Math.PI * 2;
            dummy.updateMatrix();
            
            this.trees.setMatrixAt(placedCount, dummy.matrix);
            placedCount++;
        }
        
        this.trees.instanceMatrix.needsUpdate = true;
        console.log('Fallback cone trees created:', placedCount, 'of', treeCount);
        
        const group = new THREE.Group();
        group.add(this.trees);
        
        return group;
    }
    
    createBushes() {
        // Bushes removed for performance
        return null;
    }
    
    update(year) {
        // Trees always at full size
        if (this.trees) {
            this.trees.instanceMatrix.needsUpdate = true;
        }
    }
    
    dispose() {
        if (this.trees) {
            this.trees.geometry.dispose();
            this.trees.material.dispose();
        }
        if (this.bushes) {
            this.bushes.geometry.dispose();
            this.bushes.material.dispose();
        }
    }
}
