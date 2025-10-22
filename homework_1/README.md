## 📍 SEEU Campus 3D Viewer

This project loads a cropped `GeoJSON` of building footprints and renders them as 3D extruded meshes using [Three.js](https://threejs.org/) and [Vite](https://vitejs.dev/) for fast development.

![preview](preview.png) <!-- Optional: You can add a screenshot here -->

---

### 📦 Features

* 3D visualization of buildings using `Three.js`
* GeoJSON loading and extrusion
* Interactive orbit controls
* Vite for fast development and hot reloading

---

### 📁 Project Structure

```
.
├── index.html              # Entry point
├── main.js                 # Main Three.js scene setup
├── data/
│   └── SEEUcampus.geojson  # Cropped GeoJSON file
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

This will launch the app at:

```
http://localhost:5173/
```

---

### 🧠 Notes

* Make sure your `SEEUcampus.geojson` is in the `data/` folder.
* GeoJSON features should be of type `Polygon` or `MultiPolygon`.
* Extrusion height is randomized unless specified in attributes (could be extended).

---

### 🔧 Built With

* [Three.js](https://threejs.org/) – WebGL 3D Engine
* [Vite](https://vitejs.dev/) – Build tool
* [Turf.js](https://turfjs.org/) – (optional for cropping in preprocessing)

---