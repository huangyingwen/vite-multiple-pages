import {
  Ion,
  Terrain,
  Viewer,
  createOsmBuildingsAsync,
  HeadingPitchRoll,
} from 'cesium';
import * as Cesium from 'cesium';

import 'cesium/Build/Cesium/Widgets/widgets.css';
import carGlbUrl from '../../assets/models/test3.glb?url';
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

  const kk = [
    {
      key: 'adapter',
      y: 0.04214004799723625,
      z: 2.427785873413086,
      x: 4.063747882843018,
    },
    // {
    //   key: 'BL',
    //   y: 0.7633769512176514,
    //   z: -1.5252280235290527,
    //   x: -0.49073827266693115,
    // },
    // {
    //   key: 'body',
    //   y: 0.06135660037398338,
    //   z: -0.6945538520812988,
    //   x: -0.9104177951812744,
    // },
    {
      key: 'boom',
      y: 0.02468090131878853,
      z: -0.8128267526626587,
      x: 1.5044105052947998,
    },
    // {
    //   key: 'BR',
    //   y: -0.7482699751853943,
    //   z: -1.5273025035858154,
    //   x: -0.490215539932251,
    // },
    // {
    //   key: 'FL',
    //   y: 0.9905895590782166,
    //   z: 1.4332044124603271,
    //   x: -0.4872094392776489,
    // },
    // {
    //   key: 'FR',
    //   y: -0.9757109880447388,
    //   z: 1.432661771774292,
    //   x: -0.4892808198928833,
    // },
    {
      key: 'rod',
      y: 0.0002659037709236145,
      z: -0.3904179334640503,
      x: 1.410274624824524,
    },
    {
      key: 'sleeve',
      y: 0.013545792549848557,
      z: 0.41570156812667847,
      x: 0.4507297873497009,
    },
    {
      key: 'telescope',
      y: 0.05798061564564705,
      z: 2.1808910369873047,
      x: 4.595513820648193,
    },
    // {
    //   key: 'A',
    //   y: -0.4932810962200165,
    //   z: -1.108870506286621,
    //   x: 0.6944974064826965,
    // },
    // {
    //   key: 'B',
    //   y: -0.7439817190170288,
    //   z: -0.66168212890625,
    //   x: 1.7373952865600586,
    // },
    // {
    //   key: 'C',
    //   y: -0.7440258860588074,
    //   z: 0.8146272301673889,
    //   x: -0.043100059032440186,
    // },
    // {
    //   key: 'D',
    //   y: -0.29135724902153015,
    //   z: 2.4299113750457764,
    //   x: 4.458471775054932,
    // },
    // {
    //   key: 'E',
    //   y: 0.00764826312661171,
    //   z: 0.41687190532684326,
    //   x: 3.2046096324920654,
    // },
    // {
    //   key: 'F',
    //   y: 0.007641877979040146,
    //   z: -1.192279577255249,
    //   x: 1.4222897291183472,
    // },
  ].reduce((nodeTransformations, item) => {
    nodeTransformations[item.key] = data.reduce(
      (agg, curr, i) => {
        const time = i * 10;
        const part = curr[item.key as keyof typeof curr] as [
          number,
          number,
          number,
          number,
          number,
          number,
          number[],
        ];

        // const x = boom[6][2] - 1.5044105052947998;
        // const y = boom[6][0] - 0.02468090131878853;
        // const z = -boom[6][1] - 0.8128267526626587;

        const x = part[6][2] - item.x;
        const y = part[6][0] - item.y;
        const z = -part[6][1] + item.z;
        // const y = 0; // 绿色 反
        // const z = 1; // 红色 正
        // const x = 0; // 蓝色 正

        agg.translation.cartesian.push(time, x, y, z);

        const center = new Cesium.Cartesian3(0, 0, 0);
        console.log(part[3], part[4], part[5]);
        const heading = Cesium.Math.toRadians(90);
        const pitch = part[4] as number;
        const roll = part[5] as number;
        const hpr = new HeadingPitchRoll(heading, pitch, roll);
        const quaternion = Cesium.Transforms.headingPitchRollQuaternion(
          center,
          hpr,
        );

        agg.rotation.unitQuaternion.push(
          time,
          quaternion.x,
          quaternion.y,
          quaternion.z,
          quaternion.w,
        );
        return agg;
      },
      {
        rotation: {
          epoch: '2015-01-01T00:00:00Z',
          unitQuaternion: [] as number[],
        },
        translation: {
          epoch: '2015-01-01T00:00:00Z',
          cartesian: [] as number[],
        },
      },
    );
    return nodeTransformations;
  }, {} as Record<string, any>);

  const center1 = new Cesium.Cartesian3(0, 0, 0);
  const heading1 = Cesium.Math.toRadians(0); // x
  const pitch1 = Cesium.Math.toRadians(0); // y
  const roll1 = Cesium.Math.toRadians(0); // z
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
        interval: '2015-01-01T00:00:00Z/2015-01-01T00:25:00Z',
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
          body: {
            rotation: {
              unitQuaternion,
            },
          },
          ...kk,
          // boom: {
          //   rotation: {
          //     epoch: '2015-01-01T00:00:00Z',
          //     unitQuaternion: kk.rotation,
          //   },
          //   translation: {
          //     epoch: '2015-01-01T00:00:00Z',
          //     cartesian: kk.translation,
          //   },
          // },
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
