<script setup lang="ts">
import * as Cesium from 'cesium';
import { onMounted, ref, watch } from 'vue';
import { ION_TOKEN } from '@/consts';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import IvgClose from './assets/imgs/close.svg';
import qs from 'qs';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { ConfigProvider } from 'ant-design-vue';

// TODO: ConfigProvider 组件类型定义有 bug，先这样处理了
const AConfigProvider = ConfigProvider as any;

dayjs.locale('zh-cn');

Cesium.Ion.defaultAccessToken = ION_TOKEN;

const refMap = ref<HTMLElement>();
const map = ref<Cesium.Viewer>();
const formModel = ref({
  satellites: 'H1C',
  cycle: '',
  start_date: '',
  datatype: '',
  levels: '',
  resolution: '',
  sensor: '',
});

let layer: Cesium.ImageryLayer;
let viewer: Cesium.Viewer;

onMounted(() => {
  if (!refMap.value) return;

  viewer = new Cesium.Viewer(refMap.value, {
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

  viewer.cesiumWidget.creditContainer.remove();
  map.value = viewer;

  const TDU_Key = '5a0b14f38b73d08668496bdd51375af2'; // 天地图申请的密钥

  // 在线天地图影像服务地址(墨卡托投影)
  const TDT_IMG_W =
    'http://{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0' +
    '&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}' +
    '&style=default&format=tiles&tk=' +
    TDU_Key;
  // 在线天地图影像中文标记服务(墨卡托投影)
  const TDT_CIA_W =
    'http://{s}.tianditu.gov.cn/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0' +
    '&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}' +
    '&style=default.jpg&tk=' +
    TDU_Key;

  const Img = new Cesium.WebMapTileServiceImageryProvider({
    // 调用影响中文服务
    url: TDT_IMG_W, // url地址
    layer: 'img_w', // WMTS请求的层名称
    style: 'default', // WMTS请求的样式名称
    format: 'tiles', // MIME类型，用于从服务器检索图像
    tileMatrixSetID: 'GoogleMapsCompatible', //	用于WMTS请求的TileMatrixSet的标识符
    subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'], // 天地图8个服务器
    minimumLevel: 0, // 最小层级
    maximumLevel: 18, // 最大层级
  });

  viewer.imageryLayers.addImageryProvider(Img); // 添加到cesium图层上

  const cia = new Cesium.WebMapTileServiceImageryProvider({
    // 调用影响中文注记服务
    url: TDT_CIA_W,
    layer: 'cia_w',
    style: 'default',
    format: 'tiles',
    tileMatrixSetID: 'GoogleMapsCompatible',
    subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'], // 天地图8个服务器
    minimumLevel: 0,
    maximumLevel: 18,
  });

  viewer.imageryLayers.addImageryProvider(cia); // 添加到cesium图层上

  layer = viewer.imageryLayers.addImageryProvider(
    new Cesium.UrlTemplateImageryProvider({
      url: 'http://192.168.1.125:6605/tiles?file_name=H1C_OPER_OCT_L3A_20240529_CHL_4KM_13&x={x}&y={y}&z={z}',
    }),
  );
});

const toOptions = (values: string[]) => {
  return values.map(v => ({ value: v, label: v }));
};

const columns = [
  {
    title: '卫星',
    dataIndex: 'satellite',
  },
  {
    title: '周期',
    dataIndex: 'cycle',
  },
  {
    title: '开始时间',
    dataIndex: 'start_date',
  },
  {
    title: '数据类型',
    dataIndex: 'datatype',
  },
  {
    title: '等级',
    dataIndex: 'level',
  },
  {
    title: '分辨率',
    dataIndex: 'resolution',
  },
  {
    title: '传感器',
    dataIndex: 'sensor',
  },
];

const dataSource = ref([]);
const loading = ref(false);
const show = ref(false);

const handleDbClick = (row: any) => {
  if (!viewer || !layer) return;
  const url = `http://192.168.1.125:6605/tiles?file_name=${row.fileName}&x={x}&y={y}&z={z}`;
  viewer.imageryLayers.remove(layer);
  layer = viewer.imageryLayers.addImageryProvider(
    new Cesium.UrlTemplateImageryProvider({ url }),
  );
};

watch(
  formModel.value,
  async () => {
    loading.value = true;
    try {
      const res = await fetch(
        `http://192.168.1.125:6605/getFilename?${qs.stringify({
          ...formModel.value,
        })}`,
      );

      dataSource.value = await res.json();
      dataSource.value = dataSource.value.slice(0, 100);
    } finally {
      loading.value = false;
    }
  },
  { deep: true },
);

const handleGoBack = () => (window.location.href = '/leaflet?screen=1');
</script>

<template>
  <div class="cssc-map-wrap">
    <div ref="refMap" class="cssc-map"></div>
    <AConfigProvider :locale="zhCN">
      <div v-show="show" class="operate-wrap">
        <div class="title">
          <div>数据选择</div>
          <div @click="show = !show"><IvgClose /></div>
        </div>
        <div class="content">
          <div class="search">
            <a-row class="search-form">
              <a-col :span="6">
                <div>卫星：</div>
                <div>
                  <a-select
                    v-model:value="formModel.satellites"
                    style="width: 120px"
                    :options="toOptions(['HY1C'])"
                  />
                </div>
              </a-col>
              <a-col :span="6">
                <div>开始时间：</div>
                <div>
                  <a-date-picker
                    v-model:value="formModel.start_date"
                    style="width: 120px"
                    value-format="YYYYMMDD"
                    :disabled-date="(currentDate: dayjs.Dayjs) => currentDate.unix() < dayjs('2023-07-01').unix() || currentDate.unix() > dayjs('2024-09-21').unix()"
                  />
                </div>
              </a-col>
              <a-col :span="6">
                <div>等级：</div>
                <div>
                  <a-select
                    v-model:value="formModel.levels"
                    style="width: 120px"
                    :options="toOptions(['L3A', 'L3B'])"
                  />
                </div>
              </a-col>
              <a-col :span="6">
                <div>传感器：</div>
                <div>
                  <a-select
                    v-model:value="formModel.sensor"
                    style="width: 120px"
                    :options="toOptions(['OPER'])"
                  />
                </div>
              </a-col>
              <a-col :span="6">
                <div>周期：</div>
                <div>
                  <a-select
                    v-model:value="formModel.cycle"
                    style="width: 120px"
                    :options="toOptions(['SN', 'MO', '8D', '1D'])"
                  />
                </div>
              </a-col>
              <a-col :span="6">
                <div>数据类型：</div>
                <div>
                  <a-select
                    v-model:value="formModel.datatype"
                    style="width: 120px"
                    :options="
                      toOptions([
                        'CHL',
                        'KD9',
                        'LW5',
                        'MPP',
                        'NST',
                        'SST',
                        'TAB',
                      ])
                    "
                  />
                </div>
              </a-col>
              <a-col :span="12">
                <div>分辨率：</div>
                <div>
                  <a-select
                    v-model:value="formModel.resolution"
                    style="width: 120px"
                    :options="toOptions(['4km', '9km'])"
                  />
                </div>
              </a-col>
            </a-row>
          </div>
          <div class="dividing"></div>
          <div class="table-wrap">
            <a-table
              :data-source="dataSource"
              :columns="columns"
              :scroll="{ y: 200 }"
              :pagination="false"
              :loading="loading"
              size="small"
              :custom-row="
                (record:any) => {
                  return {
                    onDblclick: () => handleDbClick(record),
                  };
                }
              "
            />
          </div>
        </div>
      </div>
      <div v-show="!show" class="goback-btn" @click="handleGoBack">返回</div>
      <div v-show="!show" class="search-btn" @click="() => (show = !show)">
        搜索
      </div>
    </AConfigProvider>
  </div>
</template>

<style lang="less" scoped>
.cssc-map {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0 !important;
}

.operate-wrap {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 501;
  box-sizing: border-box;
  width: 100%;
  height: 412px;
  background: rgb(7 33 82 / 72%);
  border: 1px solid #2a96e8;
}

.search-btn,
.goback-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 500;
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

.goback-btn {
  top: 10px;
  left: 110px;
}

.title {
  display: flex;
  align-items: center;
  height: 37px;
  padding: 0 18px;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #fff;
  text-shadow: 0 2px 4px rgb(46 193 255 / 50%);
  background: #334d76;
  background: rgb(5 35 67 / 80%);
  background-image: linear-gradient(270deg, rgb(0 16 255 / 0%) 0%, #3765d9 95%);
  background-image: linear-gradient(
    270deg,
    rgb(24 39 111 / 0%) 48%,
    rgb(22 69 210 / 70%) 99%
  );
  border-radius: 7px 7px 0 0;
  opacity: 0.34;

  div:first-child {
    flex: 1;
  }

  div:last-child {
    padding-top: 5px;
    color: #fff;

    &:hover {
      color: rgb(48 141 255 / 77%);
      cursor: pointer;
    }
  }
}

.search-form {
  padding: 20px 12px 0;
  color: #fff;

  :deep(.ant-col) {
    display: flex;
    align-items: center;
    justify-items: center;
    padding-bottom: 12px;

    > div:first-child {
      width: 70px;
    }
  }

  :deep(.ant-select-selection-item) {
    color: rgb(255 255 255 / 25%) !important;
  }

  :deep(.ant-select-arrow) {
    color: rgb(255 255 255 / 25%) !important;
  }

  :deep(.ant-select) {
    background: #05183b;
    border: 1px solid #73b0fa;
    border-radius: 4px;
  }

  :deep(.ant-select-selector) {
    position: relative;
    background: #05183b;
    border: 0;
    border-radius: 4px;
  }

  :deep(.ant-picker) {
    color: rgb(255 255 255 / 25%) !important;
    background: #05183b;
    border: 1px solid #73b0fa;
    border-radius: 4px;

    input {
      color: rgb(255 255 255 / 25%) !important;
    }
  }

  :deep(.ant-picker-separator) {
    color: rgb(255 255 255 / 25%) !important;
  }
}

.dividing {
  height: 1px;
  border-top: 1px solid #4b5e81;
}

.table-wrap {
  height: 400px;
  padding: 12px 12px 0;

  :deep(.ant-table) {
    color: #fff;
    background-color: unset;
  }

  :deep(th.ant-table-cell) {
    color: #fff;
    background: #304b85;
    border-start-start-radius: 0 !important;
    border-start-end-radius: 0 !important;
    opacity: 0.81;

    &::before {
      display: none;
    }
  }

  :deep(.ant-table-cell) {
    border: 0 !important;
  }

  :deep(.ant-table-cell-row-hover) {
    background: #5fd7d6 !important;
  }

  :deep(.ant-table-tbody > tr.ant-table-placeholder:hover > td) {
    background: unset !important;
  }

  :deep(.ant-table-body) {
    &::-webkit-scrollbar {
      width: 10px;
    }

    &::-webkit-scrollbar-track {
      background: rgb(7 33 82 / 72%);
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: #304b85;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: rgb(100 100 100);
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:active {
      background: rgb(68 68 68);
      border-radius: 10px;
    }
  }
}
</style>

<style lang="css">
.ant-select-dropdown {
  background: #05183b !important;
  border: 1px solid #73b0fa;
  border-radius: 6px;
}

.ant-select-item-option-content {
  color: rgb(255 255 255 / 25%) !important;
}

.ant-select-item-option-selected {
  background-color: #5fd7d6 !important;
}

/* .ant-picker-date-panel { */

/*   background: #05183b !important; */

/* } */

/*  */

/* .ant-picker-cell-in-view, */

/* .ant-picker-header-view, */

/* .ant-picker-dropdown { */

/*   color: rgba(255, 255, 255, 0.25) !important; */

/*  */

/*   th { */

/*     color: rgba(255, 255, 255, 0.25) !important; */

/*   } */

/* } */

/*  */

/* .ant-picker-cell-in-range { */

/*   &::before { */

/*     background-color: #5fd7d6 !important; */

/*   } */

/* } */
</style>
