import dayjs from 'dayjs';
import * as L from 'leaflet';
import borders from './borders.json';

export default function loadMap(
  mapCon: HTMLElement,
  area: 'world' | 'zhoushan' = 'zhoushan',
) {
  const map = L.map(mapCon, {
    center: [30.21, 122.8],
    minZoom: 1,
    maxZoom: 30,
    zoom: area === 'zhoushan' ? 9 : 2,
    zoomControl: false,
    doubleClickZoom: false,
  });

  // map.scrollWheelZoom.disable();
  // map.dragging.disable();
  // map.doubleClickZoom.disable();

  //控制地图底图
  const baseLayers = [
    L.tileLayer(
      'http://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
      { subdomains: '1234' },
    ),
    L.tileLayer(
      'http://webst0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8',
      { subdomains: '1234' },
    ),
    L.tileLayer(
      'http://117.173.87.250:9000/api/Map/Tile?name=TongboHaitu&type=Normal&x={x}&y={y}&z={z}',
    ),
  ];

  baseLayers[0].addTo(map);
  baseLayers[1].addTo(map);
  // baseLayers[2].addTo(map);

  L.tileLayer(
    `http://192.168.1.199:${
      area === 'zhoushan' ? 5101 : 5201
    }/timetilemap?tmbgn=${dayjs('2024-02-01 00:00:00').unix()}&tmend=${dayjs(
      '2024-02-08 00:00:00',
    ).unix()}&x={x}&y={y}&z={z}`,
  ).addTo(map);

  if (area === 'zhoushan') {
    borders.data.forEach(border => {
      L.polyline(
        border.points.map(point => [
          Number(point.latitude),
          Number(point.longitude),
        ]),
        { color: 'rgb(62,130,225)' },
      ).addTo(map);
    });
  }

  return map;
}
