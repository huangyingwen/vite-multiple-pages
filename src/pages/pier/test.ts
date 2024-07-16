import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { ION_TOKEN } from '@/consts';
import groundVehicleGlb from '@/assets/models/test2.glb?url';

Cesium.Ion.defaultAccessToken = ION_TOKEN;

(async () => {
  const cesiumContainer = document.createElement('div');
  document.body.appendChild(cesiumContainer);

  const viewer = new Cesium.Viewer(cesiumContainer, {
    shouldAnimate: true,
  });

  // Make sure viewer is at the desired time.
  const start = Cesium.JulianDate.fromDate(new Date(2018, 11, 12, 15));
  const totalSeconds = 10;
  const stop = Cesium.JulianDate.addSeconds(
    start,
    totalSeconds,
    new Cesium.JulianDate(),
  );
  viewer.clock.startTime = start.clone();
  viewer.clock.stopTime = stop.clone();
  viewer.clock.currentTime = start.clone();
  viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
  viewer.timeline.zoomTo(start, stop);

  // Create a path for our vehicle by lerping between two positions.
  const position = new Cesium.SampledPositionProperty();
  const startPosition = new Cesium.Cartesian3(
    -2379556.799372864,
    -4665528.205030263,
    3628013.106599678,
  );
  const endPosition = new Cesium.Cartesian3(
    -2379603.7074103747,
    -4665623.48990283,
    3627860.82704567,
  );
  // A velocity vector property will give us the entity's speed and direction at any given time.
  const velocityVectorProperty = new Cesium.VelocityVectorProperty(
    position,
    false,
  );
  const velocityVector = new Cesium.Cartesian3();
  // Store the wheel's rotation over time in a SampledProperty.
  const wheelAngleProperty = new Cesium.SampledProperty(Number);
  let wheelAngle = 0;

  const numberOfSamples = 100;
  for (let i = 0; i <= numberOfSamples; ++i) {
    const factor = i / numberOfSamples;
    const time = Cesium.JulianDate.addSeconds(
      start,
      factor * totalSeconds,
      new Cesium.JulianDate(),
    );

    // Lerp using a non-linear factor so that the vehicle accelerates.
    const locationFactor = Math.pow(factor, 2);
    const location = Cesium.Cartesian3.lerp(
      startPosition,
      endPosition,
      locationFactor,
      new Cesium.Cartesian3(),
    );
    position.addSample(time, location);
    // Rotate the wheels based on how fast the vehicle is moving at each timestep.
    velocityVectorProperty.getValue(time, velocityVector);
    const metersPerSecond = Cesium.Cartesian3.magnitude(velocityVector);
    const wheelRadius = 0.735; // in meters.
    const circumference = Math.PI * wheelRadius * 2;
    const rotationsPerSecond = metersPerSecond / circumference;

    wheelAngle +=
      ((Math.PI * 2 * totalSeconds) / numberOfSamples) * rotationsPerSecond;
    wheelAngleProperty.addSample(time, wheelAngle);
  }

  function updateSpeedLabel(time, result) {
    velocityVectorProperty.getValue(time, velocityVector);
    const metersPerSecond = Cesium.Cartesian3.magnitude(velocityVector);
    const kmPerHour = Math.round(metersPerSecond * 3.6);

    return `${kmPerHour} km/hr`;
  }

  const rotationProperty = new Cesium.CallbackProperty(function (time, result) {
    return Cesium.Quaternion.fromAxisAngle(
      Cesium.Cartesian3.UNIT_Y,
      wheelAngleProperty.getValue(time),
      result,
    );
  }, false);

  const wheelTransformation = new Cesium.NodeTransformationProperty({
    rotation: rotationProperty,
  });

  const center1 = new Cesium.Cartesian3(0, 0, 0);
  const heading1 = Cesium.Math.toRadians(360);
  const pitch1 = Cesium.Math.toRadians(0);
  const roll1 = Cesium.Math.toRadians(180);
  const hpr1 = new Cesium.HeadingPitchRoll(heading1, pitch1, roll1);
  const quaternion1 = Cesium.Transforms.headingPitchRollQuaternion(
    center1,
    hpr1,
  );

  const nodeTransformations = {
    BL: wheelTransformation,
    BR: wheelTransformation,
    FL: wheelTransformation,
    FR: wheelTransformation,
    ...['body'].reduce(
      (agg, curr) => ({
        ...agg,
        [curr]: new Cesium.NodeTransformationProperty({
          rotation: quaternion1,
        }),
      }),
      {},
    ),
  };

  // Add our vehicle model.
  const vehicleEntity = viewer.entities.add({
    position,
    orientation: new Cesium.VelocityOrientationProperty(position), // Automatically set the vehicle's orientation to the direction it's facing.
    model: {
      uri: groundVehicleGlb,
      runAnimations: false,
      nodeTransformations,
    },
    label: {
      text: new Cesium.CallbackProperty(updateSpeedLabel, false),
      font: '20px sans-serif',
      showBackground: true,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 100.0),
      eyeOffset: new Cesium.Cartesian3(0, 3.5, 0),
    },
  });

  viewer.trackedEntity = vehicleEntity;

  // viewer.clock.onStop = () => {
  //   console.log('alsdkfjlasdflasdf');
  // };
  vehicleEntity.viewFrom = new Cesium.Cartesian3(-10.0, 7.0, 4.0);
})();
