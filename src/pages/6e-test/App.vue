<script setup lang="ts">
import * as Cesium from 'cesium';
import { onMounted, ref } from 'vue';
import loadMap from './loadMap';
import dayjs from 'dayjs';
import { getColor } from './utils';

const refMap = ref<HTMLElement>();
let mapviewer: ReturnType<typeof loadMap>;
let timeId;
const dayCount = ref(1);
const countNum = ref(0);
let start = dayjs('2024-01-05 00:00:00');
let end = dayjs('2024-01-05 00:10:00');

const entities: Record<string, { entity: Cesium.Entity; count: number }> = {};

onMounted(() => {
  mapviewer = loadMap(refMap.value!);
  getData();
});

const getData = async () => {
  start.add(10, 'm');
  end.add(10, 'm');
  try {
    const res = await fetch(
      `http://192.168.1.12:5229/webapi/GetShipCountList?reso=0.0002&start=${start.format(
        'YYYY-MM-DD HH:mm:ss',
      )}&end=${end.format('YYYY-MM-DD HH:mm:ss')}`,
      { credentials: 'same-origin', mode: 'cors' },
    );
    const data = await res.json();

    data.forEach(({ x, y, count }) => {
      countNum.value += count;
      const key = `${x}-${y}`;
      if (entities[key]) {
        entities[key].count += count;

        entities[key].entity.point = new Cesium.PointGraphics({
          color: Cesium.Color.fromCssColorString(getColor(entities[key].count)),
          pixelSize: 5,
        });
        return;
      }

      const entity = mapviewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(x * 0.0002, y * 0.0002, 0),
        point: {
          color: Cesium.Color.fromCssColorString(getColor(count)),
          pixelSize: 5,
        },
      });

      entities[key] = { entity, count };
    });

    dayCount.value++;
  } catch (e) {
    console.log(e);
  }

  timeId = setTimeout(getData, 1000 * 60 * 5);
};
</script>

<template>
  <div class="main">
    <div class="header1">舟山海洋大数据 感知数据示意图</div>
    <div class="header2">
      <div class="header2-left">
        <div class="city"></div>
      </div>

      <div class="day-count">
        <div class="day-count-wrap">
          <div class="day-count-4">{{ dayCount.toString()[3] || '' }}</div>
          <div class="day-count-3">{{ dayCount.toString()[2] || '' }}</div>
          <div class="day-count-2">{{ dayCount.toString()[1] || '' }}</div>
          <div class="day-count-1">{{ dayCount.toString()[0] || '' }}</div>
        </div>
      </div>
      <div class="data-count">
        <div class="data-count-title">数据统计</div>
        <div class="data-count-num">{{ countNum }}</div>
      </div>
    </div>
    <div class="cssc-map" ref="refMap"></div>
  </div>
</template>

<style lang="less">
html,
body,
.rootcon,
.main {
  margin: 0 !important;
  width: 100%;
  height: 100%;
}

div {
  box-sizing: border-box;
}

.main {
  display: flex;
  flex-direction: column;
  background-image: url(./assets/imgs/bg.jpg);

  .header1 {
    height: 68px;
    background-image: url(./assets/imgs/3.svg);
    font-size: 28px;
    font-weight: normal;
    line-height: normal;
    text-align: left;
    letter-spacing: 0px;
    color: #4ce0ff;
    padding-top: 18px;
    padding-left: 28px;
  }

  .header2 {
    display: flex;
    height: 92px;
    padding: 36px 15px 0;
    align-items: center;
    margin-top: 8px;

    &-left {
      flex: 1;
    }

    .city {
      background-image: url(./assets/imgs/2.png);
      width: 335px;
      height: 32px;
    }

    .day-count {
      background-image: url(./assets/imgs/1.png);
      width: 280px;
      height: 58px;

      position: relative;
      top: 0;
      left: 0;

      color: #4ce0ff;
      font-size: 22px;

      .day-count-wrap {
        position: absolute;
        top: 15px;
        left: 146px;
        display: flex;

        width: 120px;

        div {
          text-align: center;
          width: 22px;
          margin-right: 5px;
        }
      }
    }

    .data-count {
      margin-left: 18px;
      width: 281px;
      height: 58px;
      background-image: url(./assets/imgs/5.svg);
      background-repeat: no-repeat;
      display: flex;
      align-items: center;
      padding: 0 9px 0 20px;

      &-title {
        font-size: 17px;
        font-weight: normal;
        line-height: normal;
        letter-spacing: 0.71px;
        color: #ffffff;
      }

      &-num {
        flex: 1;
        font-size: 35px;
        text-align: right;
        letter-spacing: 0.44px;
        color: #ffffff;
        width: 210px;
      }
    }
  }

  .cssc-map {
    flex: 1;
    height: 100px;
    padding: 15px;
  }
}
</style>
