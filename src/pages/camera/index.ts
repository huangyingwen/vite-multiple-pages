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
  const viewer = new Cesium.Viewer(cesiumContainer, {
    terrain: Cesium.Terrain.fromWorldTerrain(),
  });

  // viewer.camera.flyTo({
  //   destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 15000.0),
  //   orientation: {
  //     heading: Cesium.Math.toRadians(20.0),
  //     pitch: Cesium.Math.toRadians(-35.0),
  //     roll: 0.0,
  //   },
  // });
  // var west = -90.0;
  // var south = 38.0;
  // var east = -87.0;
  // var north = 40.0;
  // var rectangle = viewer.entities.add({
  //   rectangle: {
  //     coordinates: Cesium.Rectangle.fromDegrees(west, south, east, north),
  //   },
  // });
  // viewer.flyTo(rectangle);

  // viewer.camera.flyTo({
  //   destination: new Cesium.Cartesian3(
  //     -3961951.575572026,
  //     3346492.0945766014,
  //     3702340.5336036095,
  //   ),
  //   orientation: {
  //     direction: new Cesium.Cartesian3(
  //       0.8982074415844437,
  //       -0.4393530288745287,
  //       0.013867512433959908,
  //     ),
  //     up: new Cesium.Cartesian3(
  //       0.12793638617798253,
  //       0.29147314437764565,
  //       0.9479850669701113,
  //     ),
  //   },
  //   complete: function () {
  //     setTimeout(function () {
  //       viewer.camera.flyTo({
  //         destination: new Cesium.Cartesian3(
  //           -2304817.2435183465,
  //           -3639113.128132953,
  //           4688495.013644141,
  //         ),
  //         orientation: {
  //           direction: new Cesium.Cartesian3(
  //             0.3760550186878076,
  //             0.9007147395506565,
  //             0.21747547189489164,
  //           ),
  //           up: new Cesium.Cartesian3(
  //             -0.20364591529594356,
  //             -0.14862471084230877,
  //             0.9676978022659334,
  //           ),
  //         },
  //         easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
  //         duration: 5,
  //       });
  //     }, 1000);
  //   },
  // });

  // const center = Cesium.Cartesian3.fromRadians(
  //   2.4213211833389243,
  //   0.6171926869414084,
  //   3626.0426275055174,
  // );
  // const transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
  // viewer.scene.camera.lookAtTransform(
  //   transform,
  //   new Cesium.HeadingPitchRange(0, -Math.PI / 4, 2900),
  // );

  // Lock camera to a point
  const center = Cesium.Cartesian3.fromRadians(
    2.4213211833389243,
    0.6171926869414084,
    3626.0426275055174,
  );
  const transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
  viewer.scene.camera.lookAtTransform(
    transform,
    new Cesium.HeadingPitchRange(0, -Math.PI / 8, 2900),
  );

  // Orbit this point
  viewer.clock.onTick.addEventListener(function () {
    viewer.scene.camera.rotateRight(0.005);
  });

  // Disable camera collision to allow it to go underground
  viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
})();
