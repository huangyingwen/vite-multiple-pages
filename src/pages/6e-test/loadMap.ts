import { Cartesian3, Ion, Terrain, Viewer } from 'cesium';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { ION_TOKEN } from '@/consts';
import data from './assets/condition1_20240107.json';
import { getColor } from './utils';
import pointGlb from './assets/point.glb?url';
import loadGif from './loadGif';
import pointGif from './assets/point.gif?url';
import './CircleBlurMaterialProperty';
import CircleBlurMaterialProperty from './CircleBlurMaterialProperty';
import CirclePulseMaterialProperty from './CirclePulseMaterialProperty';
import dayjs from 'dayjs';
import Zoom from './Zoom';

Ion.defaultAccessToken = ION_TOKEN;

export default function (cesiumContainer: HTMLElement) {
  const viewer = new Viewer(cesiumContainer, {
    terrain: Terrain.fromWorldTerrain(),
    baseLayerPicker: false,
    shouldAnimate: true,
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

  viewer.scene.screenSpaceCameraController.enableRotate = false;
  viewer.scene.screenSpaceCameraController.enableZoom = false;
  viewer.scene.screenSpaceCameraController.enableTilt = false;
  // viewer.scene.screenSpaceCameraController.enableTranslate = false;

  // const zoom = new Zoom(viewer);
  // zoom.big(0.7);

  const layer = new Cesium.UrlTemplateImageryProvider({
    // url: `http://192.168.1.199:5201/timetilemap?tmbgn=${BGN_TIME}&tmend=${END_TIME}&x={x}&y={y}&z={z}`,
    // url: `http://192.168.1.199:5201/timetiledifference?tmbgn1=${BGN_TIME}&tmend1=${END_TIME}&tmbgn2=${BGN_TIME+10800}&tmend2=${END_TIME+10800}&x={x}&y={y}&z={z}`,
    url: `http://192.168.1.199:5201/timetilemap?tmbgn=${dayjs(
      '2024-02-01 00:00:00',
    ).unix()}&tmend=${dayjs('2024-02-08 00:00:00').unix()}&x={x}&y={y}&z={z}`,
    minimumLevel: 2,
    maximumLevel: 9,
  });

  // 添加图层
  // var hotmaplayer = viewer.imageryLayers.addImageryProvider(layer);

  // let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  // handler.setInputAction(function (event) {
  //   let ray = viewer.camera.getPickRay(event.position);
  //   let cartesian = viewer.scene.globe.pick(ray, viewer.scene);
  //   let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  //   let lng = Cesium.Math.toDegrees(cartographic.longitude); // 经度
  //   let lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
  //   let alt = cartographic.height; // 高度
  //   let coordinate = {
  //     longitude: Number(lng.toFixed(6)),
  //     latitude: Number(lat.toFixed(6)),
  //     altitude: Number(alt.toFixed(2)),
  //   };
  //   console.log(coordinate);
  // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(122.57, 30.21, 450000.0),
    orientation: {
      heading: Cesium.Math.toRadians(20.0),
      pitch: Cesium.Math.toRadians(-35.0),
      roll: 0.0,
    },
  });

  viewer.cesiumWidget.creditContainer.style.display = 'none';

  const start = Cesium.JulianDate.fromIso8601('2018-01-01T00:00:00.00Z');
  const mid = Cesium.JulianDate.addSeconds(start, 2, new Cesium.JulianDate());
  const stop = Cesium.JulianDate.addSeconds(start, 4, new Cesium.JulianDate());

  const clock = viewer.clock;
  clock.startTime = start;
  clock.currentTime = start;
  clock.stopTime = stop;
  clock.clockRange = Cesium.ClockRange.LOOP_STOP;

  var pulseProperty = new Cesium.SampledProperty(Number);
  pulseProperty.setInterpolationOptions({
    interpolationDegree: 3,
    interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
  });

  pulseProperty.addSample(start, 1.0);
  pulseProperty.addSample(mid, 15.0);
  pulseProperty.addSample(stop, 7.0);

  let i = 0;
  function addEntity() {
    i += 0.1;
    const entity = viewer.entities.add({
      position: Cartesian3.fromDegrees(122.318 + i, 29.8132 + i, 0),
      point: {
        pixelSize: pulseProperty,
        color: Cesium.Color.ORANGERED,
      },
    });

    new Cesium.ColorMaterialProperty();

    const stopFunc = () => {
      entity.point!.pixelSize = new Cesium.ConstantProperty(7);

      clock.onStop.removeEventListener(stopFunc);
    };

    clock.onStop.addEventListener(stopFunc);

    setTimeout(addEntity, 1000 * 5);
  }

  // addEntity();

  // const kk = viewer.entities.add({
  //   position: Cartesian3.fromDegrees(122.318, 29.8132, 0),
  //   model: {
  //     uri: pointGlb,
  //     runAnimations: true,
  //     scale: 1,
  //   },
  // });

  // clock.onStop.addEventListener(() => {
  //   viewer.entities.remove(kk);
  // });

  // viewer.trackedEntity = kk;
  //

  // const gif = [];
  // loadGif(pointGif, gif);
  // let k = 0;
  // const bb = viewer.entities.add({
  //   position: Cesium.Cartesian3.fromDegrees(100, 40),
  //   billboard: {
  //     verticalOrigin: Cesium.VerticalOrigin.BASELINE,
  //     image: new Cesium.CallbackProperty(() => {
  //       if (gif.length) {
  //         if (k < gif.length - 1) {
  //           k++;
  //         } else {
  //           k = 0;
  //         }
  //         return gif[k];
  //       } else {
  //         return pointGif; //因为loadGif是异步的，在解析完成之前先使用原图
  //       }
  //     }, false),
  //     scale: 0.5,
  //   },
  // });
  //
  // viewer.trackedEntity = bb;

  // let k = 0;
  // const colors = [
  //   Cesium.Color.fromCssColorString('#00FF00'),
  //   Cesium.Color.fromCssColorString('#880808'),
  // ];
  // const kk = viewer.entities.add({
  //   position: Cartesian3.fromDegrees(123.318, 30.8132, 0),
  //   // position: Cesium.Cartesian3.fromDegrees(113.9236839, 22.528061),
  //   name: '模糊圆2',
  //   ellipse: {
  //     semiMinorAxis: 10000.0,
  //     semiMajorAxis: 10000.0,
  //     material: new CirclePulseMaterialProperty({
  //       color: Cesium.Color.fromCssColorString('#00FF00'),
  //       // color: new Cesium.CallbackProperty(() => {
  //       //   if (colors.length) {
  //       //     if (k < colors.length - 1) {
  //       //       k++;
  //       //     } else {
  //       //       k = 0;
  //       //     }
  //       //     return colors[k];
  //       //   } else {
  //       //     return colors[0]; //因为loadGif是异步的，在解析完成之前先使用原图
  //       //   }
  //       // }, false),
  //       speed: 12.0,
  //     }),
  //   },
  // });
  //
  // setTimeout(() => {
  //   viewer.entities.remove(kk);
  // }, 1000 * 6);

  return viewer;
}
