import {
  Cartesian3,
  Ion,
  Math,
  Terrain,
  createOsmBuildingsAsync,
  Viewer,
  Color,
  JulianDate,
  SampledPositionProperty,
  TimeInterval,
  TimeIntervalCollection,
  PathGraphics,
  IonResource,
  VelocityOrientationProperty,
  Quaternion,
  Matrix3,
  HeadingPitchRoll,
  Transforms,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { ION_TOKEN } from '@/consts';
import feijiGlb from '@/assets/models/feiji.glb?url';
import hangmuGlb from '@/assets/models/hangmu.glb?url';

Ion.defaultAccessToken = ION_TOKEN;

(async () => {
  const cesiumContainer = document.createElement('div');
  document.body.appendChild(cesiumContainer);

  const viewer = new Viewer(cesiumContainer, {
    terrain: Terrain.fromWorldTerrain({
      requestWaterMask: true,
    }),
  });

  // viewer.camera.flyTo({
  //   destination: Cartesian3.fromDegrees(122.05, 35.07, 600),
  //   orientation: {
  //     heading: Math.toRadians(0.0),
  //     pitch: Math.toRadians(-15.0),
  //   },
  // });
  //

  // Add Cesium OSM Buildings, a global 3D buildings layer.
  const buildingTileset = await createOsmBuildingsAsync();
  viewer.scene.primitives.add(buildingTileset);

  // STEP 6 CODE (airplane entity)
  async function loadModel() {
    // Load the glTF model from Cesium ion.
    const aircraftCarrierEntity = viewer.entities.add({
      id: 'aircraft-carrier',
      position: Cartesian3.fromDegrees(122.05, 35.07, 9),
      // Attach the 3D model instead of the green point.
      model: {
        uri: hangmuGlb,
        // minimumPixelSize: 500,
        // maximumScale: 10000,
        // show: true,
      },
    });

    const orientation = setModelDirection(122.04984, 34, 90);

    const feijiEntity1 = viewer.entities.add({
      id: 'feiji1',
      position: Cartesian3.fromDegrees(122.049748, 35.069884, 11.9),
      orientation,
      // Attach the 3D model instead of the green point.
      model: {
        uri: feijiGlb,
        scale: 0.3,
        // minimumPixelSize: 500,
        // maximumScale: 10000,
        // show: true,
      },
    });

    feijiEntity1.parent = aircraftCarrierEntity;

    const feijiEntity2 = viewer.entities.add({
      id: 'feiji2',
      position: Cartesian3.fromDegrees(122.049618, 35.069885, 11.9),
      orientation,
      // Attach the 3D model instead of the green point.
      model: {
        uri: feijiGlb,
        scale: 0.3,
      },
    });

    feijiEntity2.parent = aircraftCarrierEntity;

    viewer.trackedEntity = aircraftCarrierEntity;
  }

  loadModel();
  routeSimulation(viewer);
})();

function setModelDirection(
  longitude: number,
  latitude: number,
  direction: number,
) {
  const center = Cartesian3.fromDegrees(longitude, latitude, 0);
  const heading = Math.toRadians(direction);
  const pitch = 0;
  const roll = 0;
  const hpr = new HeadingPitchRoll(heading, pitch, roll);
  const orientation = Transforms.headingPitchRollQuaternion(center, hpr);

  return orientation;
}

function routeSimulation(viewer: Viewer) {
  const flightData: Array<[number, number, number]> = [
    [122.049628, 35.069989, 11.9],
  ];

  for (let i = 0; i < 1000; i++) {
    const x = window.Math.floor(i / 7);
    flightData.push([
      flightData[i][0] + ((0.0001 * i) / 10) * (x + 1),
      flightData[i][1],
      flightData[i][2] + (flightData[i][2] < 1000 ? x * 2 : 0),
    ]);
  }

  /* Initialize the viewer clock:
  Assume the radar samples are 30 seconds apart, and calculate the entire flight duration based on that assumption.
  Get the start and stop date times of the flight, where the start is the known flight departure time (converted from PST 
    to UTC) and the stop is the start plus the calculated duration. (Note that Cesium uses Julian dates. See 
    https://simple.wikipedia.org/wiki/Julian_day.)
  Initialize the viewer's clock by setting its start and stop to the flight start and stop times we just calculated. 
  Also, set the viewer's current time to the start time and take the user to that time. 
*/
  const timeStepInSeconds = 30;
  const totalSeconds = timeStepInSeconds * (flightData.length - 1);
  const start = JulianDate.fromIso8601('2020-03-09T23:10:00Z');
  const stop = JulianDate.addSeconds(start, totalSeconds, new JulianDate());
  viewer.clock.startTime = start.clone();
  viewer.clock.stopTime = stop.clone();
  viewer.clock.currentTime = start.clone();
  viewer.timeline.zoomTo(start, stop);
  // Speed up the playback speed 50x.
  viewer.clock.multiplier = 50;
  // Start playing the scene.
  viewer.clock.shouldAnimate = true;

  // The SampledPositionedProperty stores the position and timestamp for each sample along the radar sample series.
  const positionProperty = new SampledPositionProperty();

  for (let i = 0; i < flightData.length; i++) {
    const [longitude, latitude, height] = flightData[i];

    // Declare the time for this individual sample and store it in a new JulianDate instance.
    const time = JulianDate.addSeconds(
      start,
      i * timeStepInSeconds,
      new JulianDate(),
    );
    const position = Cartesian3.fromDegrees(longitude, latitude, height);
    // Store the position along with its timestamp.
    // Here we add the positions all upfront, but these can be added at run-time as samples are received from a server.
    positionProperty.addSample(time, position);

    // viewer.entities.add({
    //   description: `Location: (${longitude}, ${latitude}, ${height})`,
    //   position,
    //   point: { pixelSize: 10, color: Color.RED },
    // });
  }

  const feijiEntity3 = viewer.entities.add({
    id: 'feiji3',
    // position: Cartesian3.fromDegrees(122.049628, 35.069981, 11.9),
    orientation: setModelDirection(122.04984, 34, 180),
    // Attach the 3D model instead of the green point.
    model: {
      uri: feijiGlb,
      scale: 0.3,
    },

    availability: new TimeIntervalCollection([
      new TimeInterval({ start, stop }),
    ]),
    position: positionProperty,
    // Automatically compute the orientation from the position.
    // orientation: new VelocityOrientationProperty(positionProperty),
    // path: new PathGraphics({ width: 3 }),
  });

  viewer.trackedEntity = feijiEntity3;
}
