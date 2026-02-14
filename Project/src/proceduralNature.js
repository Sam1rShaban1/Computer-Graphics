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
            const gltf = await this.gltfLoader.loadAsync('/models/uploads_files_6756133_Tree+.glb');
            const treeModel = gltf.scene;
            
            const treeMaterial = new THREE.MeshStandardMaterial({
                color: 0x228B22,
                roughness: 0.8,
                metalness: 0.1
            });
            
            // Collect all meshes from the tree model
            const treeMeshes = [];
            treeModel.traverse((child) => {
                if (child.isMesh) {
                    child.material = treeMaterial;
                    child.castShadow = true;
                    child.receiveShadow = true;
                    treeMeshes.push(child);
                }
            });
            
            if (treeMeshes.length === 0) {
                console.warn('No meshes found in tree model, using fallback');
                return this.createFallbackTrees();
            }
            
            // Merge all tree meshes into one geometry
            const mergedGeometry = this.mergeTreeMeshes(treeMeshes);
            
            // Ensure geometry has valid normals for smooth shading
            mergedGeometry.computeVertexNormals();
            mergedGeometry.computeBoundingBox();
            mergedGeometry.computeBoundingSphere();
            
            const bbox = mergedGeometry.boundingBox;
            const treeHeight = bbox.max.y - bbox.min.y;
            
            // Flip upside down first, then center and rotate
            mergedGeometry.rotateX(Math.PI); // Flip
            mergedGeometry.center();
            mergedGeometry.rotateX(-Math.PI / 2); // Rotate to make vertical
            // Move so base is at origin
            mergedGeometry.translate(0, 0, treeHeight / 2);
            // Scale down
            mergedGeometry.scale(0.3, 0.3, 0.3);
            
            const treeCount = 750;
            this.trees = new THREE.InstancedMesh(mergedGeometry, treeMaterial, treeCount);
            this.trees.castShadow = true;
            this.trees.receiveShadow = true;
            this.trees.frustumCulled = false; // Always render since trees cover large area
            
            const dummy = new THREE.Object3D();
            
            const groundMinX = -600;
            const groundMaxX = 600;
            const groundMinY = -300;
            const groundMaxY = 900;
            
            const buildingZones = [
                { x: 100, y: 350, radius: 150 },
                { x: -50, y: 400, radius: 220 },
                { x: 50, y: 250, radius: 200 },
                { x: 150, y: 400, radius: 180 },
                { x: 0, y: 300, radius: 300 },
            ];
            
            const infrastructureZones = [
                { x: 50, y: 350, radius: 80 },
                { x: -20, y: 380, radius: 60 },
                { x: 80, y: 280, radius: 70 },
                { x: 0, y: 450, radius: 50 },
                { x: 120, y: 380, radius: 40 },
                { x: -100, y: 300, radius: 60 },
                { x: 200, y: 350, radius: 50 },
            ];
            
            function isNearBuilding(x, y) {
                for (const zone of buildingZones) {
                    const dist = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
                    if (dist < zone.radius) return true;
                }
                return false;
            }
            
            function isNearInfrastructure(x, y) {
                for (const zone of infrastructureZones) {
                    const dist = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
                    if (dist < zone.radius) return true;
                }
                return false;
            }
            
            function isInsideGroundPlane(x, y) {
                return x >= groundMinX && x <= groundMaxX && y >= groundMinY && y <= groundMaxY;
            }
            
            let placedCount = 0;
            let attemptCount = 0;
            const maxAttempts = treeCount * 10;
            
            while (placedCount < treeCount && attemptCount < maxAttempts) {
                attemptCount++;
                
                const x = (Math.random() - 0.5) * 1200;
                const y = (Math.random() - 0.5) * 1200 + 300;
                
                if (!isInsideGroundPlane(x, y)) continue;
                if (isNearBuilding(x, y)) continue;
                if (isNearInfrastructure(x, y)) continue;
                if (Math.sqrt(x * x + (y - 300) * (y - 300)) < 80) continue;
                
                const z = 0;
                const scale = 1.0 + Math.random() * 1.5;
                
                dummy.position.set(x, y, z);
                dummy.scale.set(scale, scale, scale);
                dummy.rotation.z = Math.random() * Math.PI * 2;
                dummy.updateMatrix();
                
                this.trees.setMatrixAt(placedCount, dummy.matrix);
                placedCount++;
            }
            
            this.trees.instanceMatrix.needsUpdate = true;
            
            const group = new THREE.Group();
            group.add(this.trees);
            
            return group;
            
        } catch (error) {
            console.warn('Failed to load tree model, using fallback:', error.message);
            return this.createFallbackTrees();
        }
    }
    
    mergeTreeMeshes(meshes) {
        // Update world matrices before extracting
        const tempMatrix = new THREE.Matrix4();
        
        const geometries = [];
        
        meshes.forEach(mesh => {
            const geometry = mesh.geometry.clone();
            // Get world transform
            mesh.updateMatrixWorld(true);
            geometry.applyMatrix4(mesh.matrixWorld);
            geometries.push(geometry);
        });
        
        const mergedGeometry = this.mergeBufferGeometries(geometries);
        mergedGeometry.center();
        
        return mergedGeometry;
    }
    
    mergeBufferGeometries(geometries) {
        // Manual merge since we don't have BufferGeometryUtils imported
        let totalVertices = 0;
        let totalIndices = 0;
        
        geometries.forEach(geo => {
            totalVertices += geo.attributes.position.count;
            if (geo.index) {
                totalIndices += geo.index.count;
            } else {
                totalIndices += geo.attributes.position.count;
            }
        });
        
        const positions = new Float32Array(totalVertices * 3);
        const normals = new Float32Array(totalVertices * 3);
        const indices = new Uint32Array(totalIndices);
        
        let vertexOffset = 0;
        let indexOffset = 0;
        let indexVertexOffset = 0;
        
        geometries.forEach(geo => {
            const pos = geo.attributes.position;
            const norm = geo.attributes.normal;
            
            for (let i = 0; i < pos.count; i++) {
                positions[(vertexOffset + i) * 3] = pos.getX(i);
                positions[(vertexOffset + i) * 3 + 1] = pos.getY(i);
                positions[(vertexOffset + i) * 3 + 2] = pos.getZ(i);
                
                if (norm) {
                    normals[(vertexOffset + i) * 3] = norm.getX(i);
                    normals[(vertexOffset + i) * 3 + 1] = norm.getY(i);
                    normals[(vertexOffset + i) * 3 + 2] = norm.getZ(i);
                }
            }
            
            if (geo.index) {
                for (let i = 0; i < geo.index.count; i++) {
                    indices[indexOffset + i] = geo.index.getX(i) + indexVertexOffset;
                }
                indexOffset += geo.index.count;
            } else {
                for (let i = 0; i < pos.count; i++) {
                    indices[indexOffset + i] = i + indexVertexOffset;
                }
                indexOffset += pos.count;
            }
            
            indexVertexOffset += pos.count;
            vertexOffset += pos.count;
        });
        
        const merged = new THREE.BufferGeometry();
        merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        merged.setIndex(new THREE.BufferAttribute(indices, 1));
        
        return merged;
    }
    
    createFallbackTrees() {
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
        
        // Ground plane boundaries shifted by +300 on Y axis
        const groundMinX = -600;
        const groundMaxX = 600;
        const groundMinY = -300;  // -600 + 300
        const groundMaxY = 900;   // 600 + 300
        
        // Building exclusion zones (adjusted for +300 Y offset)
        const buildingZones = [
            { x: 100, y: 350, radius: 150 },
            { x: -50, y: 400, radius: 220 },
            { x: 50, y: 250, radius: 200 },
            { x: 150, y: 400, radius: 180 },
            { x: 0, y: 300, radius: 300 },
        ];
        
        // Road and walkway exclusion zones (adjusted for +300 Y offset)
        const infrastructureZones = [
            { x: 50, y: 350, radius: 80 },
            { x: -20, y: 380, radius: 60 },
            { x: 80, y: 280, radius: 70 },
            { x: 0, y: 450, radius: 50 },
            { x: 120, y: 380, radius: 40 },
            { x: -100, y: 300, radius: 60 },
            { x: 200, y: 350, radius: 50 },
        ];
        
        function isNearBuilding(x, y) {
            for (const zone of buildingZones) {
                const dist = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
                if (dist < zone.radius) return true;
            }
            return false;
        }
        
        function isNearInfrastructure(x, y) {
            for (const zone of infrastructureZones) {
                const dist = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
                if (dist < zone.radius) return true;
            }
            return false;
        }
        
        function isInsideGroundPlane(x, y) {
            return x >= groundMinX && x <= groundMaxX && y >= groundMinY && y <= groundMaxY;
        }
        
        let placedCount = 0;
        let attemptCount = 0;
        const maxAttempts = treeCount * 10;
        
        while (placedCount < treeCount && attemptCount < maxAttempts) {
            attemptCount++;
            
            // Trees spawn within ground plane bounds with +300 Y offset
            const x = (Math.random() - 0.5) * 1200;
            const y = (Math.random() - 0.5) * 1200 + 300;
            
            // Must be inside ground plane
            if (!isInsideGroundPlane(x, y)) continue;
            
            // Keep trees away from buildings
            if (isNearBuilding(x, y)) continue;
            
            // Keep trees away from roads and walkways
            if (isNearInfrastructure(x, y)) continue;
            
            // Keep trees away from center (adjusted for Y offset)
            if (Math.sqrt(x * x + (y - 300) * (y - 300)) < 80) continue;
            
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
