import {
  Ion,
  Terrain,
  Viewer,
  createOsmBuildingsAsync,
  HeadingPitchRoll,
} from 'cesium';
import * as Cesium from 'cesium';

import 'cesium/Build/Cesium/Widgets/widgets.css';
import carGlbUrl from '../../assets/models/小车拆分2.glb?url';
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

  viewer.extend(Cesium.viewerCesiumInspectorMixin);

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

  const kks = [];

  for (let i = 0; i <= 36; i++) {
    // const center = new Cesium.Cartesian3(
    //   -0.08603348582983017,
    //   -0.5941498279571533,
    //   1.5073353052139282,
    // );
    const center = new Cesium.Cartesian3(0, 0, 0);
    // const center = Cesium.Cartesian3.fromDegrees(120, -30, -1000000);
    const heading = Cesium.Math.toRadians(360);
    const pitch = Cesium.Math.toRadians(-i * 10);
    const roll = Cesium.Math.toRadians(0);
    const hpr = new HeadingPitchRoll(heading, pitch, roll);
    const quaternion = Cesium.Transforms.headingPitchRollQuaternion(
      center,
      hpr,
    );
    console.log(quaternion);

    kks.push(i * 10, quaternion.x, quaternion.y, quaternion.z, quaternion.w);
  }

  console.log(kks, '==============');

  const center1 = new Cesium.Cartesian3(0, 0, 0);
  // const center = Cesium.Cartesian3.fromDegrees(120, -30, -1000000);
  const heading1 = Cesium.Math.toRadians(360);
  const pitch1 = Cesium.Math.toRadians(0);
  const roll1 = Cesium.Math.toRadians(0);
  const hpr1 = new HeadingPitchRoll(heading1, pitch1, roll1);
  const quaternion1 = Cesium.Transforms.headingPitchRollQuaternion(
    center1,
    hpr1,
  );

  const unitQuaternion = [
    quaternion1.x,
    quaternion1.y,
    quaternion1.z,
    quaternion1.w,
  ];

  const czml = [
    {
      id: 'document',
      name: 'CZML Model',
      version: '1.0',
      clock: {
        interval: '2015-01-01T00:00:00Z/2015-01-01T00:06:00Z',
        currentTime: '2015-01-01T00:00:00Z',
        multiplier: 20,
      },
    },
    {
      id: 'model',
      name: '装卸车',
      position: {
        cartographicDegrees: [120, 30, 1000],
      },
      viewFrom: {
        cartesian: [4.3, 0.1, 2.6],
        // cartesian: [100, 100, 100],
      },
      model: {
        gltf: carGlbUrl,
        scale: 200,
        runAnimations: false,
        nodeTransformations: {
          ...[
            'adapter',
            'BL',
            'body',
            'boom',
            'BR',
            'FL',
            'FR',
            'rod',
            'sleeve',
            'telescope',
            '块1',
            '块2',
            '块3',
          ].reduce(
            (agg, curr) => ({
              ...agg,
              [curr]: {
                rotation: {
                  unitQuaternion,
                },
              },
            }),
            {},
          ),
          起吊器: {
            // translation: {
            //   epoch: '2015-01-01T00:00:00Z',
            //   cartesian: [0, 0, -1, 0, 10, 0, -2, 0, 20, 0, -3, 0],
            // },
          },
          // boom: {
          //   rotation: {
          //     epoch: '2015-01-01T00:00:00Z',
          //     unitQuaternion: kks,
          //   },
          // },
          Wheels: {
            rotation: {
              unitQuaternion,
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
      const carEntity = dataSource.entities.getById('model');
      viewer.trackedEntity = carEntity;

      // dataSource.entities.getById('model')?.model?.nodeTransformations
    })
    .catch(function (error) {
      window.alert(error);
    });
}
