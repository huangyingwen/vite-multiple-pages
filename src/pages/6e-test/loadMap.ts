import { Cartesian3, Ion, Terrain, Viewer } from 'cesium';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { ION_TOKEN } from '@/consts';
import data from './assets/condition1_20240107.json';
import { getColor } from './utils';

Ion.defaultAccessToken = ION_TOKEN;

export default function (cesiumContainer: HTMLElement) {
  const viewer = new Viewer(cesiumContainer, {
    terrain: Terrain.fromWorldTerrain(),
    baseLayerPicker: false,
    shouldAnimate: false,
    infoBox: false,
    timeline: false,
    fullscreenButton: false,
    homeButton: false,
    navigationHelpButton: false,
    animation: false,
    geocoder: false,
    sceneModePicker: false,
    selectionIndicator: false,
  });

  viewer.scene.mode = Cesium.SceneMode.SCENE2D;

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(123.72, 30.38, 450000.0),
    orientation: {
      heading: Cesium.Math.toRadians(20.0),
      pitch: Cesium.Math.toRadians(-35.0),
      roll: 0.0,
    },
  });

  viewer.cesiumWidget.creditContainer.style.display = 'none';

  // var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
  // handler.setInputAction(event => {
  //   var pickedPosition = viewer.scene.pickPosition(event.position);
  //   if (Cesium.defined(pickedPosition)) {
  //     console.log(pickedPosition);
  //   }
  // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  for (let i = 0; i < 10; i++) {
    var array = new Uint32Array(10000);
    window.crypto.getRandomValues(array);

    data.Sheet1.forEach(({ X, Y, count }, i) => {
      const random = array[i % 10000] * 10;
      viewer.entities.add({
        position: Cartesian3.fromDegrees(
          X * 0.0002 + random,
          Y * 0.0002 + random,
          0,
        ),
        point: {
          color: Cesium.Color.fromCssColorString(getColor(count + random * 3)),
          pixelSize: 5,
        },
      });
    });
  }

  // viewer.entities.add({
  //   position: Cartesian3.fromDegrees(122.318, 29.8132, 0),
  //   point: {
  //     color: Cesium.Color.fromCssColorString('red'),
  //     pixelSize: 5,
  //   },
  // });

  // Add Cesium OSM Buildings, a global 3D buildings layer.
  // const buildingTileset = await createOsmBuildingsAsync();
  // viewer.scene.primitives.add(buildingTileset);
  //
  return viewer;
}
