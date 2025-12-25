# Computer Graphics - Homework 2: Texturing, Animation, and Interaction

## Assignment Overview
This assignment extends the campus model from Assignment 1 by adding textures, animations, and interactive features to create a more visually rich and engaging 3D scene.

## GitHub Repository
**Link:** https://github.com/Sam1rShaban1/Computer-Graphics/tree/main/homework_2

## Requirements Completed ✓

### 1. Building Textures
- Applied three distinct materials to buildings:
  - **Plaster Facade** - Neutral plaster with subtle roughness
  - **Stone Facade** - Textured stone surface with cool tones  
  - **Glass Facade** - Reflective glass curtain wall with transparency

### 2. Ground Textures
- **Grass areas** using brown_mud_leaves texture with proper tiling
- **Road surfaces** using asphalt texture with displacement mapping
- **Walkways** using concrete pavers texture

### 3. Transparent Material
- Glass facade material with:
  - 92% transmission for realistic transparency
  - Reflection and refraction properties
  - Proper IOR (1.45) for glass

### 4. GLTF Model
- Jacaranda tree loaded from [jacaranda_tree_1k.gltf](cci:7://file:///d:/Computer-Graphics/homework_2/jacaranda_tree_1k.gltf:0:0-0:0)
- Properly scaled and positioned within campus
- Shadow casting and receiving enabled

### 5. Animation
- **Sun movement** - Directional light orbits continuously
- Adjustable animation speed (0.006 rad/frame)
- Dynamic shadows that follow sun position

### 6. Interaction
- **Click detection** on buildings using raycasting
- **Highlight system** - Buildings glow when selected
- **Info panel** displays:
  - Building name and height
  - Material type and description
  - Texture file paths

### 7. Enhanced Lighting
- **Hemisphere light** - Sky/ground illumination (intensity 2.0)
- **Directional light** - Animated sun with shadows
- **Point light** - Warm fill light for depth
- **Tone mapping** - ACESFilmic with 1.3 exposure

### 8. OrbitControls
- Camera navigation maintained
- Damping enabled for smooth movement
- Proper target positioning

## Technical Implementation

### Scene Scaling
- Entire campus grouped under `campusGroup` with 0.01 scale
- Ground texture tiling adjusted to 800× for appropriate detail
- Camera repositioned for optimal viewing distance

### Material System
- Modular material descriptors for easy cycling
- Proper texture wrapping and anisotropy settings
- Physical material properties for realistic rendering

### Performance Optimizations
- Texture anisotropy set to 16 for sharp details
- Shadow map resolution: 2048×2048
- Efficient raycasting for interaction

## How to Run
```bash
cd homework_2
npm install
npm run dev