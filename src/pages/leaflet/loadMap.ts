import dayjs from 'dayjs';
import * as L from 'leaflet';
import 'leaflet.chinatmsproviders';
import borders from './borders.json';

export default function loadMap(
  mapCon: HTMLElement,
  area: 'world' | 'zhoushan' = 'zhoushan',
) {
  const map = L.map(mapCon, {
    center: [30.235318, 122.408295],
    minZoom: 1,
    maxZoom: 30,
    zoom: area === 'zhoushan' ? 9 : 3,
    zoomControl: false,
    doubleClickZoom: false,
    attributionControl: false,
  });

  // map.scrollWheelZoom.disable();
  // map.dragging.disable();
  // map.doubleClickZoom.disable();

  L.tileLayer
    .chinaProvider('TianDiTu.Terrain.Map', {
      key: '9829017c7b20927b26a45802b58fd1df',
    })
    .addTo(map);

  L.tileLayer
    .chinaProvider('TianDiTu.Terrain.Annotion', {
      key: '9829017c7b20927b26a45802b58fd1df',
    })
    .addTo(map);

  if (area === 'zhoushan') {
    borders.data.forEach(border => {
      L.polygon(
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

const urlMap = {
  zhoushan: {
    ais: 'aisZhoushan',
    radar: 'radarZhoushan',
    fly: 'dikongZhoushan',
    bd: 'beidouZhoushan',
  },
  world: {
    ais: 'aisWorld',
  },
};

export function addHotMapLayer() {
  let layer: L.Layer | undefined;
  return (map: L.Map, area: 'zhoushan' | 'world', type: string) => {
    if (layer) {
      layer.remove();
      layer = undefined;
      return;
    }

    layer = L.tileLayer(
      `http://192.168.1.199:5801/tileMap/${
        urlMap[area][type] as any
      }/summonth?x={x}&y={y}&z={z}&months=12`,
    ).addTo(map);
  };
}

export function addMapCarousel() {
  let timeId: number | undefined;
  let months = 1;
  let hotmaplayer: L.Layer | undefined;

  return (map: L.Map, area: 'zhoushan' | 'world', type: string) => {
    function getHeatmap() {
      const url = `x={x}&y={y}&z={z}&months=${months}`;

      return L.tileLayer(
        `http://192.168.1.199:5801/tileMap/${
          urlMap[area][type] as any
        }/summonth?${url}`,
      ).addTo(map);
    }

    function setIntervalCallback() {
      if (hotmaplayer) hotmaplayer.remove();
      hotmaplayer = getHeatmap();
      months++;
      if (months > 11) {
        months = 1;
      }
    }

    if (timeId || hotmaplayer) {
      clearInterval(timeId);
      hotmaplayer?.remove();
      hotmaplayer = undefined;
      timeId = undefined;
      return;
    }

    months = 1;
    timeId = setInterval(setIntervalCallback, 1000 * 10) as unknown as number;
    setIntervalCallback();
  };
}
