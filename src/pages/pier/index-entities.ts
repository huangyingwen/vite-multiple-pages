import {
  Ion,
  Terrain,
  Viewer,
  createOsmBuildingsAsync,
  HeadingPitchRoll,
} from 'cesium';
import * as Cesium from 'cesium';

import 'cesium/Build/Cesium/Widgets/widgets.css';
import carGlbUrl from '../../assets/models/车拆分.glb?url';
import { ION_TOKEN } from '@/consts';
import data from './data1.json';

Ion.defaultAccessToken = ION_TOKEN;

export default async function rendering() {
  const cesiumContainer = document.createElement('div');
  document.body.appendChild(cesiumContainer);

  const viewer = new Viewer(cesiumContainer, {
    terrain: Terrain.fromWorldTerrain(),
    shouldAnimate: true,
  });

  const osmBuildings = await createOsmBuildingsAsync();
  viewer.scene.primitives.add(osmBuildings);

  const kk = data.reduce(
    (agg, curr, i) => {
      const time = i * 100;
      const boom = curr.boom as [
        number,
        number,
        number,
        number,
        number,
        number,
        number[],
      ];

      // pos_boom = Pos(-0.086033, -1.5073, 0.59415)
      // -0.08603348582983017, ,
      const x = boom[6][0] + 0.08603348582983017;
      const y = -boom[6][2] + 0.5941498279571533;
      const z = boom[6][1] + 1.5073353052139282;

      agg.translation.push(time, x, y, z);

      const center = new Cesium.Cartesian3(0, 0, 0);
      const heading = boom[3] as number;
      const pitch = boom[4] as number;
      const roll = boom[5] as number;
      const hpr = new HeadingPitchRoll(heading, pitch, roll);
      const quaternion = Cesium.Transforms.headingPitchRollQuaternion(
        center,
        hpr,
      );

      agg.rotation.push(
        time,
        quaternion.x,
        quaternion.y,
        quaternion.z,
        quaternion.w,
      );
      return agg;
    },
    { translation: [] as number[], rotation: [] as number[] },
  );

  console.log(kk);

  // loadModel();
  const czml = [
    {
      id: 'document',
      name: 'CZML Model',
      version: '1.0',
      clock: {
        interval: '2015-01-01T00:00:00Z/2015-01-01T00:00:20Z',
        currentTime: '2015-01-01T00:00:00Z',
        multiplier: 20,
      },
    },
    {
      id: 'model',
      position: {
        cartographicDegrees: [120, 30, 1000],
      },
      viewFrom: {
        // cartesian: [4.3, 0.1, 2.6],
        cartesian: [100, 100, 100],
      },
      model: {
        gltf: carGlbUrl,

        scale: 200,
        runAnimations: false,
        nodeTransformations: {
          起吊器: {
            // translation: {
            //   epoch: '2015-01-01T00:00:00Z',
            //   cartesian: [0, 0, -1, 0, 10, 0, -2, 0, 20, 0, -3, 0],
            // },
          },
          架2: {
            // rotation: {
            //   epoch: '2015-01-01T00:00:00Z',
            //   unitQuaternion: [
            //     0, -0.23381920887303329, -0.6909886782144156,
            //     -0.0938384854833712, 0.6775378681547408, 10,
            //     -0.4924076887347565, -0.6304934596091216, 0.20657864059632378,
            //     0.563327551886459, 20, -0.23381920887303329,
            //     -0.6909886782144156, -0.0938384854833712, 0.6775378681547408,
            //   ],
            // },
            translation: {
              epoch: '2015-01-01T00:00:00Z',
              // cartesian: [0, 0, -1, 0, 10, 0, -2, 0, 20, 0, -3, 0],
              cartesian: kk.translation,
              // cartesian: [0, 3, 0],
            },
            rotation: {
              epoch: '2015-01-01T00:00:00Z',
              // unitQuaternion: kk.rotation,
              unitQuaternion: [0, 0.5, 0, 0.5],
            },
          },
        },
      },
    },
  ];

  const dataSourcePromise = viewer.dataSources.add(
    Cesium.CzmlDataSource.load(czml),
  );

  dataSourcePromise
    .then(function (dataSource) {
      viewer.trackedEntity = dataSource.entities.getById('model');
    })
    .catch(function (error) {
      window.alert(error);
    });
}
