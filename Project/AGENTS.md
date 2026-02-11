# AGENTS.md - SEEU Campus Three.js Project

## Project Overview
This is a Three.js project that renders the SEEU campus 3D map with buildings, roads, walkways, and interactive features. The project uses Vite for development and builds a web-based 3D visualization.

## Build Commands

### Development
```bash
npm run dev          # Start development server with hot reload
```

### Build & Preview
```bash
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Testing
```bash
npm test             # Run tests (currently placeholder - no test framework configured)
```

> Note: This project doesn't have a formal testing framework yet. When adding tests, consider using Jest or Vitest with Three.js testing utilities.

## Code Style Guidelines

### Imports & Dependencies
- Use ES6 import syntax consistently
- Three.js imports: `import * as THREE from 'three'`
- Three.js addons: `import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'`
- Group imports in this order: 1) Three.js core, 2) Three.js examples, 3) Local modules
- Always import Three.js modules from `three/` not `three/dist/`

### File Structure & Naming
- Use camelCase for variables and functions
- Use PascalCase for classes and constructors
- Use descriptive names: `campusGroup`, `buildingMeshes`, `highlightBuilding`
- File names: kebab-case for utilities (e.g., `materials.js`, `walkways.js`)
- Constants: UPPER_SNAKE_CASE for configuration values

### Three.js Specific Patterns

#### Scene Organization
```javascript
// Group related objects together
const campusGroup = new THREE.Group();
scene.add(campusGroup);

// Scale and position groups, not individual objects when possible
campusGroup.scale.setScalar(1);
campusGroup.rotation.x = -Math.PI / 2;
```

#### Materials & Textures
```javascript
// Configure textures consistently
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.anisotropy = 16;

// Clone materials for multiple objects
const material = baseMaterial.clone();
material.name = baseMaterial.name;
```

#### Geometry Creation
```javascript
// Use ExtrudeGeometry for GeoJSON buildings
const geometry = new THREE.ExtrudeGeometry(shape, { 
    depth: height, 
    bevelEnabled: false 
});

// Enable shadows on meshes
mesh.castShadow = true;
mesh.receiveShadow = true;
```

### Error Handling
- Use `.catch()` for fetch operations
- Provide fallbacks for missing assets:
```javascript
fetch(url)
    .then(res => res.json())
    .catch(err => console.warn(`Failed to load ${url}:`, err));
```

- Graceful degradation for textures and models:
```javascript
exrLoader.load(
    'textures/environment.exr',
    (texture) => { /* success */ },
    undefined,
    (error) => {
        console.warn('HDRI not found, using fallback');
        scene.background = null;
    }
);
```

### Performance Guidelines
- Batch geometry loading and processing
- Use `Raycaster` efficiently for interaction
- Implement proper cleanup in animation loops
- Set reasonable `anisotropy` values for textures
- Use `PCFSoftShadowMap` for better shadow quality

### Code Organization

#### Main Application Structure (main.js)
1. **Setup Phase**: Renderer, scene, camera, controls
2. **Lighting**: Hemisphere, directional, fill lights
3. **Materials**: Configure textures and create materials
4. **Data Loading**: GeoJSON files, models, textures
5. **Interaction**: Raycasting, event handlers
6. **Animation Loop**: RequestAnimationFrame loop

#### Helper Files
- `src/materials.js`: Texture loading and material creation
- `helper/*.js`: Specialized data processing utilities

### GeoJSON Processing Patterns
```javascript
// Coordinate projection
function projectCoord([lon, lat]) {
    const scale = 100000;
    return [(lon - 20.96) * scale, (lat - 41.985) * scale];
}

// Feature processing
data.features.forEach(feature => {
    const featureName = feature.properties?.name || 'Unnamed Building';
    const height = Number(feature.properties?.estimated_height) || 10;
    
    // Create shape from coordinates
    const shape = new THREE.Shape();
    polygon[0].forEach((coord, i) => {
        const [x, y] = projectCoord(coord);
        i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
    });
});
```

### Interaction Patterns
```javascript
// Raycasting for object selection
raycaster.setFromCamera(pointer, camera);
const intersects = raycaster.intersectObjects(buildingMeshes, true);

// Highlighting with emissive color
if (mesh.material?.emissive) {
    mesh.material.emissive.setHex(0x1a304c);
}
```

### Asset Management
- Store textures in `textures/` directory
- 3D models in `models/` directory
- GeoJSON data in `data/` and `campus/buildings/`
- Use relative paths from project root

### Browser Compatibility
- Target modern browsers with ES6+ support
- Use `Math.min(window.devicePixelRatio, 2)` for pixel ratio
- Handle window resize events properly
- Consider mobile touch events for interaction

## Development Notes

### Camera Setup
- Default position: `(0, 20, 20)` with Z as up direction
- Use OrbitControls for navigation
- Enable damping for smooth movement

### Coordinate System
- Project GPS coordinates to local space
- Scale factor: 100000 for precision
- Campus center at approximately (20.96, 41.985)

### Shadow Configuration
- Use `PCFSoftShadowMap` for quality
- Shadow camera: 440x440 units coverage
- 2048x2048 shadow map resolution
- Enable on both casters and receivers

This project follows Three.js best practices for performance and maintainability while providing an interactive 3D campus visualization experience.

## New System Modules (2025+)

### Ground System (`src/groundSystem.js`)
- Infinite procedural grass with view-dependent visibility
- Shader-based rendering for performance
- 2000x2000 unit ground plane with distance-based detail

### Procedural Nature (`src/proceduralNature.js`)
- Instanced mesh rendering for 5000+ trees
- Noise-based tree placement
- Seasonal color changes based on timeline
- Bushes and vegetation clusters

### Dynamic Lighting (`src/dynamicLighting.js`)
- Time-of-day cycling (60 seconds per full day)
- Sun position and color temperature changes
- Moon light for nighttime
- Hemisphere lighting for ambient

### Camera Controller (`src/cameraController.js`)
- Smooth camera transitions between viewpoints
- Preset camera positions (overview, aerial, entrance, library)
- Cinematic easing functions
- Focus-on-building functionality

### Minimap UI (`src/minimapUI.js`)
- Real-time radar-style campus overview
- Building type color coding
- Camera position and direction indicator
- Interactive campus navigation

### Timeline UI (`src/timelineUI.js`)
- Year-by-year campus evolution control
- Auto-play with configurable speed
- Instant jump vs animated transitions
- Play/pause functionality

### Building Animator (`src/buildingAnimator.js`)
- Construction animation (scale + rise from ground)
- Building state management
- Sequential animation queue
- Pause/resume support

## Performance Targets

### Desktop (60 FPS)
- 5000+ instanced trees
- 50+ animated buildings
- Dynamic lighting and shadows
- Full camera controls

### Mobile (24 FPS)
- Reduced tree count (2000)
- Simplified shadows
- LOD building system
- Optimized shaders