---

# 📍 SEEU Campus Interactive 3D Viewer

This project renders an interactive, 3D model of the SEEU campus, complete with buildings, roads, and walkways. It uses [Three.js](https://threejs.org/) to process multiple `GeoJSON` files in the browser and creates a realistic scene with PBR materials and dynamic shadows. The development environment is powered by [Vite](https://vitejs.dev/) for a fast and modern workflow.

![preview](preview.png)

---

### ✨ Features

*   **Interactive 3D Campus:** A full 3D visualization of the campus, not just buildings.
*   **Multiple Data Sources:** Loads and processes separate GeoJSON files for buildings, roads, and walkways.
*   **Data-Driven Building Heights:** Building heights are not random; they are read directly from the `estimated_height` property in the GeoJSON data.
*   **Custom Geometry Processing:** Correctly interprets a unique GeoJSON structure where some polygons act as "holes" for the walkway mesh.
*   **Realistic PBR Materials:** Uses `MeshPhysicalMaterial` and `MeshStandardMaterial` with properties like `roughness` and `clearcoat` for a realistic look without requiring external textures.
*   **Dynamic Lighting & Shadows:** Features a realistic lighting setup with a sun (DirectionalLight) and sky (HemisphereLight) that cast soft, dynamic shadows.
*   **Smooth Orbit Controls:** Full freedom to pan, zoom, and rotate around the scene.
*   **Fast Development with Vite:** Hot reloading and an optimized build process make development a breeze.

---

### 📁 Project Structure

```
.
├── index.html                  # Main HTML entry point
├── main.js                     # Core Three.js scene setup and data loading logic
├── data/
│   ├── SEEUcampus.geojson      # Building footprint data
│   ├── roads.geojson           # Road layout data
│   └── SEEU_walkway.geojson    # Walkway layout data with "hole" polygons
├── package.json
└── README.md
```

---

### 🚀 Getting Started

#### 1. Install dependencies

```bash
npm install
```

#### 2. Start the dev server

```bash
npm run dev
```

This will launch the application, typically at:

```
http://localhost:5173/
```

---

### 📊 Data Sources

*   **Buildings:** The building footprint data is sourced from [Microsoft's Global Building Footprints](https://github.com/microsoft/GlobalMLBuildingFootprints), which is often derived from OpenStreetMap data.
*   **Roads & Walkways:** These are custom GeoJSON files that were created manually to accurately represent the campus layout.

---

### 🧠 Technical Notes

*   **Coordinate Projection:** All GeoJSON coordinates (longitude/latitude) are projected into a 2D plane within the `main.js` script to ensure all data sources align perfectly.
*   **Walkway Hole Logic:** The `SEEU_walkway.geojson` file has a unique structure where red-filled polygons are treated as holes. The script identifies these, separates them, and uses Three.js's `Shape` and `Path` objects to correctly cut them out from the main walkway mesh.
*   **Materials:** The scene relies entirely on Three.js's built-in PBR materials, configured to simulate surfaces like asphalt, concrete, and architectural facades without any external texture files.

---

### 🔧 Built With

*   [Three.js](https://threejs.org/) – WebGL 3D Engine
*   [Vite](https://vitejs.dev/) – Next-Generation Frontend Tooling
