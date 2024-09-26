import * as L from 'leaflet';
import dayjs from 'dayjs';
import { watchEffect, Ref, ref } from 'vue';
import { getColor } from './utils.js';

export default function useMarks(
  map: Ref<L.Map | undefined>,
  type: string,
  area: Ref<string>,
) {
  const layer = L.layerGroup();
  const markers: Record<string, { marker: L.CircleMarker; count: number }> = {};
  const markerPulses: Record<number, L.Marker> = {};
  const myRenderer = L.canvas({ padding: 0.5 });

  const countNum = ref(0);
  let timeId: number;
  let start = dayjs('2024-08-09 20:28:00');

  const getData = async () => {
    if (!map.value) return;
    try {
      const current = Date.now();

      const res = await fetch(
        `http://192.168.1.218:5229/webapi/GetShipListNow?start=${start.format(
          'YYYY-MM-DD HH:mm:ss',
        )}&area=${area.value}&type=${type}`,
        { credentials: 'same-origin', mode: 'cors' },
      );

      start = dayjs(current);

      const data: {
        sum_count: number;
        data: Array<{
          x: string;
          y: string;
          count: number;
          count_new: number;
        }>;
      } = await res.json();

      if (countNum.value === 0) countNum.value = data.sum_count;

      let index = 0;
      for (const { x, y, count, count_new } of data.data) {
        index++;
        countNum.value += count_new;
        const key = `${x}-${y}`;
        if (markers[key]) {
          markers[key].count = count + count_new;
          markers[key].marker.setStyle({ color: getColor(count + count_new) });
        } else {
          const markerPoint = L.circleMarker([Number(y), Number(x)], {
            color: '#000', // 线颜色
            weight: 0, // 线宽度
            // opacity: 1, //透明度
            fillColor: getColor(count + count_new), // 填充色
            fillOpacity: 1, // 填充透明度
            radius: 1, // 半径
            renderer: myRenderer,
          }).addTo(layer); // 添加到this.yuangroup图层

          markers[key] = { marker: markerPoint, count: count + count_new };
        }

        const pulsingIcon = L.icon.pulse({
          iconSize: [10, 10],
          color: getColor(count + count_new),
          fillColor: getColor(count + count_new),
        });

        const markerPulseKey = index % 200;
        if (!markerPulses[markerPulseKey]) {
          markerPulses[markerPulseKey] = L.marker([Number(y), Number(x)], {
            icon: pulsingIcon,
          }).addTo(layer);
        } else {
          markerPulses[markerPulseKey]
            .setLatLng([Number(y), Number(x)])
            .setIcon(pulsingIcon);
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (e) {
      console.log(e);
    }

    timeId = setTimeout(getData, 3000) as never as number;
  };

  return [
    () => {
      // startFunc
      if (!map.value) return;
      map.value?.removeLayer(layer);
      clearTimeout(timeId);
      layer.addTo(map.value);
      getData();
    },
    (): void => {
      // stopFunc
      clearTimeout(timeId);
      map.value?.removeLayer(layer);
    },
    countNum,
  ] as const;
}
