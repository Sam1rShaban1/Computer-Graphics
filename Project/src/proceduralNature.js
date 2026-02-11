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
        try {
            // Load tree model - check multiple possible tree files
            let treeModel = null;
            const treeFiles = [
                '/models/uploads_files_6756133_Tree+.glb',
                '/models/grass.glb'  // though this might be grass model, not tree
            ];
            
            // Load the main tree model
            try {
                const gltf = await this.gltfLoader.loadAsync('/models/uploads_files_6756133_Tree+.glb');
                treeModel = gltf.scene;
                console.log('Successfully loaded main tree model');
            } catch (e) {
                console.warn('Failed to load main tree model, using fallback:', e);
                return this.createFallbackTrees();
            }
            
            if (!treeModel) {
                console.warn('No tree models could be loaded, using fallback');
                return this.createFallbackTrees();
            }
            
            // Create instanced trees using model
            const treeMaterial = new THREE.MeshStandardMaterial({
                color: 0x228B22,
                roughness: 0.8,
                metalness: 0.1
            });
            
            // Extract mesh from loaded model
            let treeMesh = null;
            treeModel.traverse((child) => {
                if (child.isMesh) {
                    treeMesh = child;
                    treeMesh.material = treeMaterial;
                }
            });
            
            if (!treeMesh) {
                console.warn('No mesh found in tree model');
                return this.createFallbackTrees();
            }
            
            // Create geometry from tree mesh
            const treeGeometry = treeMesh.geometry.clone();
            
            // Scale down the tree model geometry for better proportions
            treeGeometry.scale(0.3, 0.3, 0.3);
            
            const treeCount = 5000; // Increased tree count for better forest density
            this.trees = new THREE.InstancedMesh(treeGeometry, treeMaterial, treeCount);
            this.trees.castShadow = true;
            this.trees.receiveShadow = true;
            
            const dummy = new THREE.Object3D();
            
            for (let i = 0; i < treeCount; i++) {
                const x = (Math.random() - 0.5) * 1000;
                const y = (Math.random() - 0.5) * 1000;
                
                // Keep trees closer to center for visibility
                if (Math.sqrt(x * x + y * y) < 100) continue;
                
                const z = 0;
                const scale = 1.0 + Math.random() * 1.5;
                
                dummy.position.set(x, y, z);
                dummy.scale.set(scale, scale, scale);
                dummy.rotation.z = Math.random() * Math.PI * 2;
                dummy.updateMatrix();
                
                this.trees.setMatrixAt(i, dummy.matrix);
            }
            
            this.trees.instanceMatrix.needsUpdate = true;
            
            const group = new THREE.Group();
            group.add(this.trees);
            
            return group;
            
        } catch (error) {
            console.warn('Failed to load tree model, using fallback:', error);
            return this.createFallbackTrees();
        }
    }
    
    createFallbackTrees() {
        const treeGeometry = new THREE.ConeGeometry(2, 6, 8);
        const treeMaterial = new THREE.MeshStandardMaterial({
            color: 0x228B22,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const treeCount = 1000;
        this.trees = new THREE.InstancedMesh(treeGeometry, treeMaterial, treeCount);
        this.trees.castShadow = true;
        this.trees.receiveShadow = true;
        
        const dummy = new THREE.Object3D();
        
        for (let i = 0; i < treeCount; i++) {
            const x = (Math.random() - 0.5) * 1200;
            const y = (Math.random() - 0.5) * 1200;
            
            if (Math.sqrt(x * x + y * y) < 200) continue;
            
            const z = 3;
            const scale = 0.5 + Math.random() * 1.0;
            
            dummy.position.set(x, y, z);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.z = Math.random() * Math.PI * 2;
            dummy.updateMatrix();
            
            this.trees.setMatrixAt(i, dummy.matrix);
        }
        
        this.trees.instanceMatrix.needsUpdate = true;
        
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
