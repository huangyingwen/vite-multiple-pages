<script setup lang="ts">
import * as Cesium from 'cesium';
import { onMounted, ref } from 'vue';
import loadMap from './loadMap';
import dayjs from 'dayjs';
import { getColor } from './utils';
import CirclePulseMaterialProperty from './CirclePulseMaterialProperty';
import numberFormat from './numberFormat';

const refMap = ref<HTMLElement>();
let mapviewer: ReturnType<typeof loadMap>;
let timeId;
const dayCount = ref(346);
const startDay = dayjs('2023-09-01');
const countNum = ref(1000000);
let start = dayjs('2024-08-09  20:28:00');

const entities: Record<string, { entity: Cesium.Entity; count: number }> = {};

onMounted(async () => {
  mapviewer = loadMap(refMap.value!);
  // await initData();
  //
  await getData();
});

const initData = async () => {
  try {
    const res = await fetch(`http://192.168.1.12:5229/webapi/GetShipHistory`, {
      credentials: 'same-origin',
      mode: 'cors',
    });

    dayCount.value++;

    const data: Array<{
      x: string;
      y: string;
      count: number;
    }> = await res.json();

    let index = 0;
    for (let { x, y, count } of data) {
      index++;
      countNum.value += count;
      const key = `${x}-${y}`;

      const entity = mapviewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(Number(x), Number(y), 0),
        point: {
          color: Cesium.Color.fromCssColorString(getColor(count)),
          pixelSize: 5,
        },
      });

      entities[key] = { entity, count };

      if (index % 1000 === 0) {
        await new Promise(resolve => setTimeout(() => resolve(0), 1000));
      }
    }
  } catch (e) {
    console.log(e);
  }
};

const getData = async () => {
  try {
    const current = Date.now();

    const res = await fetch(
      `http://192.168.1.12:5229/webapi/SetShipNow?start=${start.format(
        'YYYY-MM-DD HH:mm:ss',
      )}`,
      { credentials: 'same-origin', mode: 'cors' },
    );

    start = dayjs(current);

    dayCount.value = dayjs().diff(startDay, 'd');

    const data: Array<{
      x: string;
      y: string;
      count: number;
      count_new: number;
    }> = await res.json();

    let index = 0;
    for (let { x, y, count, count_new } of data) {
      index++;
      countNum.value += count_new;
      const key = `${x}-${y}`;
      if (entities[key]) {
        entities[key].count = count + count_new;

        entities[key].entity.point = new Cesium.PointGraphics({
          color: Cesium.Color.fromCssColorString(getColor(entities[key].count)),
          pixelSize: 2,
        });
        continue;
      }

      const entity = mapviewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(Number(x), Number(y), 0),
        point: {
          color: Cesium.Color.fromCssColorString(getColor(count + count_new)),
          pixelSize: 2,
        },
      });

      entities[key] = { entity, count: count + count_new };

      const kk = mapviewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(Number(x), Number(y), 0),
        name: '模糊圆2',
        ellipse: {
          semiMinorAxis: 4000.0,
          semiMajorAxis: 4000.0,
          material: new CirclePulseMaterialProperty({
            color: Cesium.Color.fromCssColorString(getColor(count + count_new)),
            speed: 12.0,
          }),
        },
      });

      setTimeout(() => {
        mapviewer.entities.remove(kk);
      }, 1000 * 3);

      if (index % 10 === 0) {
        await new Promise(resolve => setTimeout(() => resolve(0), 1000 * 6));
      }
    }
  } catch (e) {
    console.log(e);
  }

  timeId = setTimeout(getData, 1000);
};
</script>

<template>
  <div class="main">
    <div class="header1">舟山海洋大数据 感知数据示意图</div>
    <div class="header2">
      <div class="header2-left">
        <!-- <div class="city"></div> -->
        <div class="world"></div>
      </div>

      <div class="day-count">
        <div class="day-count-wrap">{{ dayCount }}</div>
      </div>
      <div class="data-count">
        <div class="data-count-title">数据统计</div>
        <div class="data-count-num">
          <div>{{ numberFormat(countNum).num }}</div>
          <div class="data-count-uint">{{ numberFormat(countNum).uint }}</div>
        </div>
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
    height: 60px;
    padding: 16px 8px;
    align-items: center;

    &-left {
      flex: 1;
    }

    .city {
      background-image: url(./assets/imgs/2.png);
      width: 335px;
      height: 32px;
    }

    .world {
      background-image: url(./assets/imgs/4.png);
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
        right: 22px;
        display: flex;
        // width: 120px;
        letter-spacing: 14px;
        padding-left: 5px;
        text-align: right;

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
        display: flex;
        flex: 1;
        align-items: baseline;
        font-size: 35px;
        text-align: right;
        letter-spacing: 0.44px;
        color: #ffffff;
        width: 210px;

        > div {
          text-align: right;
          flex: 1;
        }

        .data-count-uint {
          font-size: 14px;
          padding-left: 4px;
          flex: unset;
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
