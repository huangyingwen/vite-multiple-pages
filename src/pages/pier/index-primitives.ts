import {
  Cartesian3,
  Ion,
  Math,
  Terrain,
  createOsmBuildingsAsync,
  Viewer,
  JulianDate,
  SampledPositionProperty,
  TimeInterval,
  TimeIntervalCollection,
  HeadingPitchRoll,
  Transforms,
  Model,
} from 'cesium';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { ION_TOKEN } from '@/consts';
import carGlb from '@/assets/models/车拆分.glb?url';

Ion.defaultAccessToken = ION_TOKEN;

(async () => {
  const cesiumContainer = document.createElement('div');
  document.body.appendChild(cesiumContainer);

  const viewer = new Viewer(cesiumContainer, {
    terrain: Terrain.fromWorldTerrain({
      requestWaterMask: true,
    }),
  });

  // Position a model with modelMatrix and display it with a minimum size of 128 pixels
  const position = Cesium.Cartesian3.fromDegrees(
    -123.0744619,
    44.0503706,
    5000.0,
  );
  const headingPositionRoll = new Cesium.HeadingPitchRoll();
  const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator(
    'north',
    'west',
  );

  viewer.camera.flyTo({
    destination: position,
    orientation: {
      heading: Math.toRadians(0.0),
      pitch: Math.toRadians(-15.0),
    },
  });

  try {
    const model = await Cesium.Model.fromGltfAsync({
      url: carGlb,
      modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
        position,
        headingPositionRoll,
        Cesium.Ellipsoid.WGS84,
        fixedFrameTransform,
      ),
      // minimumPixelSize: 128,
      scale: 1,
    });
    viewer.scene.primitives.add(model);

    model.readyEvent.addEventListener(() => {
      const kk = [
        '起吊器',
        '架1',
        '架2',
        '白杆子',
        '蓝杆子',
        '运输小车',
        '点1',
        '点2',
        '点5',
        '点3',
        '架2.001',
        '架2.002',
      ];
      for (const item of kk) {
        const elevator1 = model.getNode(item);

        const cartesian1 = Cesium.Matrix4.getTranslation(
          elevator1.originalMatrix,
          new Cesium.Cartesian3(),
        );
        console.log(
          `${cartesian1.x}, ${-cartesian1.z}, ${
            cartesian1.y
          } ${item}==========`,
        );
      }

      // const elevator2 = model.getNode('起吊器');
      //
      // const cartesian2 = Cesium.Matrix4.getTranslation(
      //   elevator1.originalMatrix,
      //   new Cesium.Cartesian3(),
      // );
      // console.log(cartesian2.x, cartesian2.y, cartesian2.z, '起吊器==========');
      // // const matrixs: Cesium.Matrix4[] = [];
      // //
      // // for (let index = 0; index < 100; index++) {
      // //   cartesian3.y += 0.015;
      // //   matrixs.push(
      // //     Cesium.Matrix4.fromTranslation(cartesian3, new Cesium.Matrix4()),
      // //   );
      // // }
      //
      // cartesian3.y += 1.5;
      //
      // elevator1.matrix = Cesium.Matrix4.fromTranslation(
      //   cartesian3,
      //   new Cesium.Matrix4(),
      // );

      // elevator1.matrix = new Cesium.CallbackProperty(() => matrixs, false);
    });
  } catch (error) {
    console.log(`Failed to load model. ${error}`);
  }
})();
