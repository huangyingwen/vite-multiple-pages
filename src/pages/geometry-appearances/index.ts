import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { ION_TOKEN } from '@/consts';

Cesium.Ion.defaultAccessToken = ION_TOKEN;

(async () => {
  const cesiumContainer = document.createElement('div');
  document.body.appendChild(cesiumContainer);

  // Keep your Cesium.Ion.defaultAccessToken = 'your_token_here' line above.
  // STEP 2 CODE
  // Initialize the viewer with Cesium World Terrain.
  const viewer = new Cesium.Viewer(cesiumContainer);

  // original code
  // viewer.entities.add({
  //   rectangle: {
  //     coordinates: Cesium.Rectangle.fromDegrees(-100.0, 20.0, -90.0, 30.0),
  //     material: new Cesium.StripeMaterialProperty({
  //       evenColor: Cesium.Color.WHITE,
  //       oddColor: Cesium.Color.BLUE,
  //       repeat: 5,
  //     }),
  //   },
  // });

  const scene = viewer.scene;

  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.RectangleGeometry({
      rectangle: Cesium.Rectangle.fromDegrees(-100.0, 20.0, -90.0, 30.0),
      vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
    }),
  });

  scene.primitives.add(
    new Cesium.Primitive({
      geometryInstances: instance,
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        material: Cesium.Material.fromType('Stripe'),
      }),
    }),
  );
})();
