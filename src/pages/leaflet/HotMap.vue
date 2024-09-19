<script setup lang="ts">
import { onMounted, ref } from 'vue';
import numberFormat from './numberFormat';
import qs from 'qs';
import legendSvg from './assets/legend.svg';
import dayjs from 'dayjs';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import './L.Icon.Pulse.css';
import './L.Icon.Pulse.js';
import './leaflet.canvas-markers.js';
import loadMap, { addHotMapLayer, addMapCarousel } from './loadMap.js';
import { getColor } from './utils.js';

const refMap = ref<HTMLElement>();
const map = ref<L.Map>();
const area = ref<'world' | 'zhoushan'>('zhoushan');
const hotmap = ref(false);
const carousel = ref(false);
const dayCount = ref(346);
const countNum = ref(0);
const startDay = dayjs('2023-09-01');
let start = dayjs('2024-08-09  20:28:00');
let timeId: any;

const markers: Record<string, { marker: L.CircleMarker; count: number }> = {};
const markerPulses: Record<number, L.Marker> = {};
const addHotmap = addHotMapLayer();
const addCarousel = addMapCarousel();
const myRenderer = L.canvas({ padding: 0.5 });

onMounted(async () => {
  const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
  area.value = (query.area || 'zhoushan') as any;
  // await initData();
  // await getData();
  //
  map.value = loadMap(refMap.value!, area.value);

  getData();
});

const getData = async () => {
  try {
    const current = Date.now();

    const res = await fetch(
      `http://192.168.1.218:5229/webapi/GetShipListNow?start=${start.format(
        'YYYY-MM-DD HH:mm:ss',
      )}&area=${area.value}`,
      { credentials: 'same-origin', mode: 'cors' },
    );

    start = dayjs(current);

    dayCount.value = dayjs().diff(startDay, 'd');

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
        }).addTo(map.value!); // 添加到this.yuangroup图层

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
        }).addTo(map.value!);
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

  timeId = setTimeout(getData, 3000);
};

const handleClick = (_area: string) => {
  window.location.href = `/leaflet.html?screen=0&area=${_area}`;
};

const handleHotmap = () => {
  hotmap.value = !hotmap.value;
  addHotmap(map.value!, area.value);
};

const handleCarousel = () => {
  carousel.value = !carousel.value;
  addCarousel(map.value!, area.value);
};
</script>

<template>
  <div class="main">
    <div class="header1">
      <div class="header1-title">舟山海洋大数据 感知数据态势图</div>
      <div class="header1-btns">
        <button
          class="hotmap"
          :class="hotmap ? 'selected' : ''"
          @click="handleHotmap()"
        ></button>
        <button
          class="carousel"
          :class="carousel ? 'selected' : ''"
          @click="handleCarousel()"
        ></button>
      </div>
    </div>
    <div class="header2">
      <div class="header2-left">
        <div
          v-if="area === 'zhoushan'"
          class="city"
          @click="handleClick('world')"
        ></div>
        <div v-else class="world" @click="handleClick('zhoushan')"></div>
      </div>

      <div class="day-count">
        <div class="day-count-wrap">{{ dayCount }}</div>
      </div>
      <div class="data-count">
        <div class="data-count-num">
          <div>{{ numberFormat(countNum).num }}</div>
          <div class="data-count-uint">{{ numberFormat(countNum).uint }}</div>
        </div>
      </div>
    </div>
    <div ref="refMap" class="cssc-map"></div>
    <div class="legend"><legendSvg /></div>
  </div>
</template>

<style lang="less" scoped>
.main {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0 !important;
}

.legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 999;
}

div {
  box-sizing: border-box;
}

.main {
  display: flex;
  flex-direction: column;
  background-image: url('./assets/imgs/bg.jpg');

  .header1 {
    display: flex;
    height: 68px;
    padding-top: 18px;
    padding-left: 28px;
    font-size: 28px;
    font-weight: normal;
    line-height: normal;
    color: #4ce0ff;
    text-align: left;
    letter-spacing: 0;
    background-image: url('./assets/imgs/3.svg');

    .header1-title {
      flex: 1;
    }

    .header1-btns {
      padding: 18px 8px 0 0;

      > button {
        width: 51px;
        height: 22px;
        padding: 0;
        margin: 0;
        background-color: transparent;
        background-size: cover;
        border: none;
        outline: none;
      }

      .hotmap {
        margin-right: 8px;
        background-image: url('./assets/imgs/hotmap.svg');

        &:hover,
        &.selected {
          background-image: url('./assets/imgs/hotmap-selected.svg');
        }
      }

      .carousel {
        background-image: url('./assets/imgs/carousel.svg');

        &:hover,
        &.selected {
          background-image: url('./assets/imgs/carousel-selected.svg');
        }
      }
    }
  }

  .header2 {
    display: flex;
    align-items: center;
    height: 60px;
    padding: 16px 8px;

    &-left {
      flex: 1;
    }

    .city {
      background-image: url('./assets/imgs/2.svg');
    }

    .world {
      background-image: url('./assets/imgs/4.svg');
    }

    .city,
    .world {
      width: 103px;
      height: 34px;
      cursor: pointer;
    }

    .day-count {
      position: relative;
      top: 0;
      left: 0;
      width: 218px;
      height: 35px;
      font-size: 22px;
      color: #4ce0ff;
      background-image: url('./assets/imgs/1.svg');

      .day-count-wrap {
        position: absolute;
        top: 3px;
        right: 17px;
        display: flex;
        padding-left: 5px;
        text-align: right;
        letter-spacing: 10px;

        div {
          width: 22px;
          margin-right: 5px;
          text-align: center;
        }
      }
    }

    .data-count {
      display: flex;
      align-items: center;
      width: 282px;
      height: 35px;
      padding: 0 9px 0 20px;
      margin-left: 18px;
      background-image: url('./assets/imgs/5.svg');
      background-repeat: no-repeat;

      &-num {
        display: flex;
        flex: 1;
        align-items: baseline;
        width: 210px;
        font-size: 24px;
        color: #fff;
        text-align: right;
        letter-spacing: 0.44px;

        > div {
          flex: 1;
          text-align: right;
        }

        .data-count-uint {
          flex: unset;
          padding-left: 4px;
          font-size: 14px;
          color: #999;
        }
      }
    }
  }

  .cssc-map {
    flex: 1;
    height: 100px;
    padding: 8px;
  }
}
</style>
