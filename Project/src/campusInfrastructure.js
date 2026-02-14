import * as THREE from 'three';

export class CampusInfrastructure {
    constructor(scene) {
        this.scene = scene;
        this.walkways = null;
        this.roads = null;
    }
    
    async loadInfrastructure() {
        await Promise.all([
            this.loadWalkways(),
            this.loadRoads()
        ]);
    }
    
    async loadWalkways() {
        try {
            const response = await fetch('/data/walkways.geojson');
            const data = await response.json();
            
            const textureLoader = new THREE.TextureLoader();
            const cobbleTexture = textureLoader.load('/textures/concrete_pavers_2k.blend/textures/concrete_pavers_diff_2k.jpg');
            cobbleTexture.wrapS = THREE.RepeatWrapping;
            cobbleTexture.wrapT = THREE.RepeatWrapping;
            cobbleTexture.repeat.set(10, 10);
            cobbleTexture.anisotropy = 8;
            cobbleTexture.colorSpace = THREE.SRGBColorSpace;
            
            const material = new THREE.MeshStandardMaterial({
                map: cobbleTexture,
                color: 0xdddddd,
                roughness: 0.9,
                metalness: 0.0
            });
            
            const walkwayGroup = new THREE.Group();
            
            data.features.forEach((feature, index) => {
                const coords = feature.geometry.coordinates[0];
                if (coords && coords.length >= 3) {
                    const shape = new THREE.Shape();
                    
                    coords.forEach((coord, i) => {
                        const [lon, lat] = coord;
                        const [x, y] = this.projectCoord(lon, lat);
                        if (i === 0) {
                            shape.moveTo(x, y);
                        } else {
                            shape.lineTo(x, y);
                        }
                    });
                    
                    const geometry = new THREE.ShapeGeometry(shape);
                    
                    const mesh = new THREE.Mesh(geometry, material); // Same material for all
                    mesh.position.z = 0.1; // Slightly above ground to prevent z-fighting
                    mesh.receiveShadow = true;
                    mesh.castShadow = false;
                    walkwayGroup.add(mesh);
                } else {
                    console.warn('Walkway feature', index, 'has invalid coordinates');
                }
            });
            
            this.walkways = walkwayGroup;
            this.scene.add(walkwayGroup);
            
        } catch (error) {
            console.warn('Failed to load walkways:', error);
        }
    }
    
    async loadRoads() {
        try {
            const response = await fetch('/data/roads.geojson');
            const data = await response.json();
            
            const textureLoader = new THREE.TextureLoader();
            const asphaltTexture = textureLoader.load('/textures/asphalt_track_2k.blend/textures/asphalt_track_diff_2k.jpg');
            asphaltTexture.wrapS = THREE.RepeatWrapping;
            asphaltTexture.wrapT = THREE.RepeatWrapping;
            asphaltTexture.repeat.set(20, 20);
            asphaltTexture.anisotropy = 16;
            
            const material = new THREE.MeshStandardMaterial({
                map: asphaltTexture,
                color: 0x555555,
                roughness: 0.8,
                metalness: 0.1
            });
            
            const roadGroup = new THREE.Group();
            
            data.features.forEach((feature, index) => {
                const coords = feature.geometry.coordinates[0];
                if (coords && coords.length >= 3) {
                    const shape = new THREE.Shape();
                    
                    coords.forEach((coord, i) => {
                        const [lon, lat] = coord;
                        const [x, y] = this.projectCoord(lon, lat);
                        if (i === 0) {
                            shape.moveTo(x, y);
                        } else {
                            shape.lineTo(x, y);
                        }
                    });
                    
                    const geometry = new THREE.ShapeGeometry(shape);
                    
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.position.z = 0.05; // Slightly above ground
                    mesh.receiveShadow = true;
                    mesh.castShadow = false;
                    roadGroup.add(mesh);
                } else {
                    console.warn('Road feature', index, 'has invalid coordinates');
                }
            });
            
            this.roads = roadGroup;
            this.scene.add(roadGroup);
            
        } catch (error) {
            console.warn('Failed to load roads:', error);
        }
    }
    
    projectCoord(lon, lat) {
        const scale = 100000;
        return [(lon - 20.96) * scale, (lat - 41.985) * scale];
    }
    
    dispose() {
        if (this.walkways) {
            this.walkways.children.forEach(mesh => {
                mesh.geometry.dispose();
                if (mesh.material.map) mesh.material.map.dispose();
                mesh.material.dispose();
            });
        }
        if (this.roads) {
            this.roads.children.forEach(mesh => {
                mesh.geometry.dispose();
                if (mesh.material.map) mesh.material.map.dispose();
                mesh.material.dispose();
            });
        }
    }
}
