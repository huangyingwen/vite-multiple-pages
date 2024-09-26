<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import qs from 'qs';
import legendSvg from './assets/legend.svg';
import dayjs from 'dayjs';
import DataAggOverview from './DataAggOverview/index.vue';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import './L.Icon.Pulse.css';
import './L.Icon.Pulse.js';
import loadMap, { addHotMapLayer, addMapCarousel } from './loadMap.js';
import { getColor } from './utils.js';
import useMarks from './useMarks.js';

const refMap = ref<HTMLElement>();
const map = ref<L.Map>();
const area = ref<'world' | 'zhoushan'>('zhoushan');
const hotmap = ref(false);
const carousel = ref(false);
const dayCount = ref(346);
const startDay = dayjs('2023-09-01');
let start = dayjs('2024-08-09 20:28:00');

const markers: Record<string, { marker: L.CircleMarker; count: number }> = {};
const markerPulses: Record<number, L.Marker> = {};
const addHotmap = addHotMapLayer();
const addCarousel = addMapCarousel();
const myRenderer = L.canvas({ padding: 0.5 });
const date = ref({ d: 0, h: 0, m: 0, s: 0 });

// ais、radar、fly、bd
const [aisStartFunc, aisStopFunc, aisCount] = useMarks(map, 'ais', area);
const [radarStartFunc, radarStopFunc, radarCount] = useMarks(
  map,
  'radar',
  area,
);
const [flyStartFunc, flyStopFunc, flyCount] = useMarks(map, 'fly', area);
const [bdStartFunc, bdStopFunc, bdCount] = useMarks(map, 'bd', area);
const markType = ref('ais');

onMounted(async () => {
  const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
  area.value = (query.area || 'zhoushan') as any;
  markType.value = (query.type || 'ais') as any;
  statisticalTime();

  if (!refMap.value) return;

  map.value = loadMap(refMap.value, area.value);
  startFunc(markType.value);
});

function statisticalTime() {
  const date1 = dayjs('2022-09-01');
  const second = dayjs().diff(date1, 's');
  date.value.d = Math.floor(second / 60 / 60 / 24);
  date.value.h = Math.floor((second / 60 / 60) % 24);
  date.value.m = Math.floor((second / 60) % 60);
  date.value.s = Math.floor(second % 60);

  setTimeout(statisticalTime, 1000);
}

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

  setTimeout(getData, 3000);
};

const handleClick = (_area: string) => {
  window.location.href = `/leaflet?screen=1&area=${_area}`;
};

const handleHotmap = () => {
  hotmap.value = !hotmap.value;
  addHotmap(map.value!, area.value, markType.value);
};

const handleCarousel = () => {
  carousel.value = !carousel.value;
  addCarousel(map.value!, area.value, markType.value);
};

const startFunc = (type = 'ais') => {
  markType.value = type;
  if (['radar', 'fly', 'bd'].includes(type) && area.value === 'world') {
    window.location.href = `/leaflet?screen=1&area=zhoushan&type=${type}`;
  }
  switch (type) {
    case 'ais':
      aisStartFunc();
      radarStopFunc();
      flyStopFunc();
      bdStopFunc();
      break;
    case 'radar':
      radarStartFunc();
      aisStopFunc();
      flyStopFunc();
      bdStopFunc();
      break;
    case 'fly':
      flyStartFunc();
      aisStopFunc();
      radarStopFunc();
      bdStopFunc();
      break;
    case 'bd':
      bdStartFunc();
      aisStopFunc();
      radarStopFunc();
      flyStopFunc();
      break;
    case 'yagan':
      window.location.href = '/leaflet?yagan=1';
      break;
  }

  if (carousel.value) {
    addCarousel(map.value!, area.value, markType.value);
    addCarousel(map.value!, area.value, markType.value);
  }

  if (hotmap.value) {
    addHotmap(map.value!, area.value, markType.value);
    addHotmap(map.value!, area.value, markType.value);
  }
};

const countNum = computed(() => {
  switch (markType.value) {
    case 'ais':
      return aisCount.value;
    case 'radar':
      return radarCount.value;
    case 'fly':
      return flyCount.value;
    case 'bd':
      return bdCount.value;
    default:
      return 0;
  }
});
</script>

<template>
  <div class="main">
    <div class="header2">
      <div class="header2-left">
        <div
          v-if="area === 'zhoushan'"
          class="city"
          @click="handleClick('world')"
        ></div>
        <div v-else class="world" @click="handleClick('zhoushan')"></div>

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

      <div class="day-count">
        <div class="day-count-wrap">
          <span>{{ date.d }}</span>
          <span>{{ date.h.toString().padStart(2, '0') }}</span>
          <span>{{ date.m.toString().padStart(2, '0') }}</span>
          <span>{{ date.s.toString().padStart(2, '0') }}</span>
        </div>
      </div>
      <div class="data-count">
        <div class="data-count-num">
          <div>{{ countNum }}</div>
        </div>
      </div>
    </div>
    <div ref="refMap" class="cssc-map"></div>
    <div class="legend"><legendSvg /></div>
    <DataAggOverview>
      <template #default="slotProps">
        <div class="menu-btns">
          <div class="nav">
            <div class="menu-item">态势上图</div>
            <div class="sub-menu">
              <div
                :class="{ selected: markType === 'ais' }"
                @click="startFunc('ais')"
              >
                AIS目标
              </div>
              <div
                :class="{ selected: markType === 'radar' }"
                @click="startFunc('radar')"
              >
                雷达目标
              </div>
              <div
                :class="{ selected: markType === 'fly' }"
                @click="startFunc('fly')"
              >
                低空目标
              </div>
              <div
                :class="{ selected: markType === 'bd' }"
                @click="startFunc('bd')"
              >
                示位仪目标
              </div>
              <div
                :class="{ selected: markType === 'yagan' }"
                @click="startFunc('yagan')"
              >
                卫星遥感
              </div>
            </div>
          </div>
          <button @click="slotProps.handleShow">数据汇聚概览</button>
        </div>
      </template>
    </DataAggOverview>
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
  z-index: 500;
}

.menu-btns {
  position: absolute;
  top: 70px;
  right: 10px;
  z-index: 500;
  display: flex;

  button,
  .nav .menu-item {
    height: 35px;
    padding: 0 24px;
    margin-left: 20px;
    font-size: 16px;
    font-weight: 500;
    line-height: 35px;
    color: #fff;
    text-align: center;
    background-image: linear-gradient(
      -29deg,
      rgb(7 29 78 / 73%) 0%,
      rgb(17 84 238 / 98%) 100%
    );
    border: 1px solid #1795ff;
    border-radius: 16px;

    &:hover {
      color: rgb(148 163 184);
      cursor: pointer;
    }
  }

  .nav {
    position: relative;

    .sub-menu {
      position: absolute;
      bottom: -148px;
      left: calc((150px - 100%) / 2);
      display: none;
      width: 140px;
      height: 146px;
      padding: 2px;
      background: center / cover no-repeat url('./assets/imgs/menu-bg.svg');

      div {
        font-size: 16px;
        line-height: 29px;
        color: #ddfbff;
        text-align: center;

        &:hover,
        &.selected {
          color: rgb(100 116 139);
        }

        &:hover {
          cursor: pointer;
        }
      }
    }

    &:hover {
      .sub-menu {
        display: block;
      }
    }
  }
}

div {
  box-sizing: border-box;
}

.main {
  .header2 {
    display: flex;
    align-items: center;
    height: 60px;
    padding: 16px 8px;

    &-left {
      display: flex;
      flex: 1;
    }

    .city {
      background-image: url('./assets/imgs/2.svg');
    }

    .world {
      background-image: url('./assets/imgs/4.svg');
    }

    .header1-btns {
      padding: 5px 0 0 40px;

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

    .city,
    .world {
      width: 103px;
      height: 34px;
      cursor: pointer;
    }

    .day-count {
      display: flex;
      align-items: center;
      justify-content: right;
      width: 355px;
      height: 44px;
      font-size: 22px;
      color: #fff;
      letter-spacing: 7px;
      background-image: url('./assets/imgs/1.svg');

      span {
        display: inline-block;
        text-align: right;
      }

      span:nth-child(4) {
        width: 39px;
      }

      span:nth-child(3) {
        width: 39px;
        margin-right: 21px;
      }

      span:nth-child(2) {
        width: 39px;
        margin-right: 24px;
      }

      span:nth-child(1) {
        margin-right: 24px;
      }
    }

    .data-count {
      display: flex;
      align-items: center;
      width: 280px;
      height: 44px;
      padding: 0 1px 0 20px;
      margin-left: 18px;
      background-image: url('./assets/imgs/5.svg');
      background-repeat: no-repeat;

      &-num {
        display: flex;
        flex: 1;
        align-items: baseline;
        width: 210px;
        font-size: 22px;
        color: #fff;
        text-align: right;
        letter-spacing: 8px;

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
    height: calc(100% - 60px);
    padding: 8px;
  }
}
</style>
