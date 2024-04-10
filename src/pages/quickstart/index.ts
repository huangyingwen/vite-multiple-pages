import {
  Cartesian3,
  Ion,
  Math,
  Terrain,
  createOsmBuildingsAsync,
  Viewer,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0OTYwYzQ1YS1mMTM5LTRkNTMtOWE0YS1iNTM0YjYzMmQ3ODEiLCJpZCI6MjA3NTU0LCJpYXQiOjE3MTI2NTI5NTN9.JbroAkWr3IkejxsKf6pte9kA0h9aSVdkbHRlr9q_xwc';

(async () => {
  const cesiumContainer = document.createElement('div');
  document.body.appendChild(cesiumContainer);

  const viewer = new Viewer(cesiumContainer, {
    terrain: Terrain.fromWorldTerrain(),
  });

  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(-122.4175, 37.655, 400),
    orientation: {
      heading: Math.toRadians(0.0),
      pitch: Math.toRadians(-15.0),
    },
  });

  // Add Cesium OSM Buildings, a global 3D buildings layer.
  const buildingTileset = await createOsmBuildingsAsync();
  viewer.scene.primitives.add(buildingTileset);
})();
