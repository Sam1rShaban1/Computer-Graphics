const fs = require('fs');
const turf = require('@turf/turf');

// SEEU Campus crop polygon
const cropPolygon = {
  "type": "Feature",
  "properties": { "name": "Crop" },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [20.959902373895176, 41.98928109021173],
        [20.959554460327467, 41.986670288499255],
        [20.960400322789354, 41.985483622703725],
        [20.961716588971058, 41.984402364878065],
        [20.964094077831845, 41.98535005446092],
        [20.96268361678281, 41.987630954388806],
        [20.963334087813422, 41.98934637306289],
        [20.960556895587814, 41.989602150506386],
        [20.96043683860563, 41.98922009227573],
        [20.959902373895176, 41.98928109021173]
      ]
    ]
  }
};

// Get input file path from command line
const inputPath = process.argv[2];
if (!inputPath) {
  console.error("❌ Please provide a path to simulation_buildings.geojson");
  process.exit(1);
}

const outputPath = 'SEEUcampus.geojson';

try {
  const rawData = fs.readFileSync(inputPath);
  const buildings = JSON.parse(rawData);

  if (!Array.isArray(buildings.features)) {
    throw new Error("Invalid GeoJSON file");
  }

  const cropped = {
    type: "FeatureCollection",
    features: buildings.features.filter(feature =>
      turf.booleanWithin(feature, cropPolygon)
    )
  };

  fs.writeFileSync(outputPath, JSON.stringify(cropped, null, 2));
  console.log(`✅ Cropped ${cropped.features.length} buildings into ${outputPath}`);
} catch (error) {
  console.error("❌ Error:", error.message);
}
