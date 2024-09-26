<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import CloseIcon from './imgs/close.svg';

const show = ref(false);
const animation = ref(false);
let timeId: number;

const handleShow = () => {
  show.value = true;
};

const data = ref<any[]>([]);

onMounted(() => {
  getData();
});

const getData = async () => {
  const res = await fetch('http://192.168.1.221:8080/storage/total/converge');
  const result = await res.json();
  data.value = result.data;
  animation.value = true;

  setTimeout(() => (animation.value = false), 3 * 1000);

  timeId = setTimeout(getData, 5 * 1000) as unknown as number;
};

onUnmounted(() => {
  timeId && clearTimeout(timeId);
  timeId = 0;
});
</script>

<template>
  <div v-show="show" class="data-agg-overview">
    <div class="header">
      <div class="title">数据概览</div>
      <div class="close" @click="show = false">
        <CloseIcon />
      </div>
    </div>
    <div class="content">
      <div v-for="item of data" :key="item.groupName" class="category">
        <div class="category-title">{{ item.groupName }}</div>
        <div class="category-content">
          <template v-for="subItem of item.sonList" :key="subItem.name">
            <div v-if="subItem.type === 'false'" class="card">
              <div class="card-data">{{ subItem.lastTime }}</div>
              <div class="card-icon"></div>
              <div class="card-title">{{ subItem.name }}</div>
            </div>
            <div v-else class="card purple" :class="{ light: animation }">
              <div class="card-data">
                {{
                  subItem.total
                    .toString()
                    .replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
                }}
              </div>
              <div class="card-icon"></div>
              <div class="card-title">{{ subItem.name }}</div>
              <Transition v-show="animation" name="slide-fade">
                <div class="card-increase">+{{ subItem.increment }}</div>
              </Transition>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
  <slot :handle-show="handleShow" />
</template>

<style lang="less" scoped>
.data-agg-overview {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 501;
  width: 100%;
  height: 100%;
  background: rgb(5 35 67 / 80%);
  backdrop-filter: blur(18px);
  box-shadow: inset 0 1px 13px 0 rgb(29 183 238 / 50%);
}

.header {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 20px;
  background: linear-gradient(270deg, rgb(0 16 255 / 0%) 0%, #3765d9 95%),
    linear-gradient(270deg, rgb(24 39 111 / 0%) 48%, rgb(22 69 210 / 70%) 99%);
  opacity: 0.34;

  .title {
    flex: 1;
    font-size: 18px;
    font-weight: 500;
    color: #a8c7ff;
  }

  .close {
    padding-top: 5px;
    color: #fff;

    &:hover {
      color: rgb(48 141 255 / 77%);
      cursor: pointer;
    }
  }
}

.content {
  padding: 30px 18px;
  overflow-x: auto;
  height: calc(100% - 104px);

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    opacity: 0.4;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgb(100 100 100);
    border-radius: 3px;
    opacity: 0.4;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #ffffff;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:active {
    background: #ffffff;
    border-radius: 3px;
  }
}

.category {
  border: 2px solid;
  border-image: linear-gradient(
      134deg,
      rgb(205 221 255 / 37%),
      rgb(255 255 255 / 0%)
    )
    2 2;

  &-title {
    height: 25px;
    padding: 0 16px;
    font-size: 16px;
    font-weight: 600;
    line-height: 25px;
    color: #fff;
    background: linear-gradient(
      270deg,
      rgb(23 114 234 / 0%) 0%,
      rgb(48 141 255 / 77%) 100%
    );
  }

  &-content {
    display: flex;
    gap: 61px;
    padding: 22px 26px;
  }
}

.card {
  position: relative;
  width: 93px;

  &-data {
    height: 21px;
    font-size: 10px;
    font-weight: 500;
    line-height: 18px;
    color: #fff;
    text-align: center;
    background: center / auto auto no-repeat url('./imgs/蓝气泡.svg');
  }

  &-icon {
    height: 54px;
    background: center / auto auto no-repeat url('./imgs/蓝icon.svg'),
      center / auto 54px no-repeat url('./imgs/蓝底座.svg');
  }

  &-title {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: #91feff;
    text-align: center;
  }

  &::before {
    position: absolute;
    top: 30px;
    right: -31px;
    width: 1px;
    height: 59px;
    content: ' ';
    border-right: 1px solid;
    border-image: linear-gradient(
        180deg,
        rgb(0 242 255 / 0%),
        rgb(0 197 255 / 100%),
        rgb(0 221 255 / 0%)
      )
      1 1;
  }

  &:last-child::before {
    display: none;
  }
}

.card.light,
.card:hover {
  .card-data {
    line-height: 16px;
    text-shadow: 0 2px 6px rgb(0 0 0 / 82%);
    background: center / auto auto no-repeat url('./imgs/蓝亮气泡.svg');
  }

  .card-icon {
    background: center / auto auto no-repeat url('./imgs/蓝亮icon.svg'),
      center / auto 74px no-repeat url('./imgs/蓝亮底座.svg');
  }

  .card-title {
    color: #4fccff;
    text-shadow: 0 2px 6px rgb(0 0 0 / 82%);
  }
}

.card.purple {
  position: relative;

  .card-data {
    width: 80px;
    margin: 0 auto;
    background: center / auto auto no-repeat url('./imgs/紫气泡.svg');
  }

  .card-icon {
    background: center / auto auto no-repeat url('./imgs/紫icon.svg'),
      center / auto 54px no-repeat url('./imgs/紫底座.svg');
  }

  .card-title {
    color: #bbaeff;
  }

  .card-increase {
    position: absolute;
    top: 20px;
    right: -24px;
    height: 12px;
    padding: 0 4px;
    font-size: 10px;
    font-weight: 500;
    line-height: 12px;
    color: #ff0b0b;
    background: #5c1414;
    border: 1px solid #f94d4d;
    border-radius: 6px;
    opacity: 0.8;
  }
}

.card.purple.light,
.card.purple:hover {
  .card-data {
    line-height: 16px;
    text-shadow: 0 2px 6px rgb(0 0 0 / 82%);
    background: center / auto auto no-repeat url('./imgs/紫亮气泡.svg');
  }

  .card-icon {
    background: center / auto auto no-repeat url('./imgs/紫亮icon.svg'),
      center / auto 74px no-repeat url('./imgs/紫亮底座.svg');
  }

  .card-title {
    color: #f8f7ff;
    text-shadow: 0 2px 6px rgb(0 0 0 / 82%), 0 1px 2px rgb(163 39 255 / 50%);
  }

  .card-increase {
    text-shadow: 0 2px 6px rgb(0 0 0 / 82%);
    box-shadow: 0 2px 6px 0 rgb(0 0 0 / 82%);
    opacity: 1;
  }
}

.slide-fade-enter-active {
  animation: bounce-in 0.5s;
}

.slide-fade-leave-active {
  animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }

  50% {
    transform: scale(1.5);
  }

  100% {
    transform: scale(1);
  }
}
</style>
