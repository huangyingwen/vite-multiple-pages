<script setup lang="ts">
import { onMounted, ref } from 'vue';
import CloseIcon from './imgs/close.svg';

const show = ref(false);

const handleShow = () => {
  show.value = true;
};
onMounted(() => {});
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
      <div class="category">
        <div class="category-title">水文数据</div>
        <div class="category-content">
          <div class="card">
            <div class="card-data">2024-08-10</div>
            <div class="card-icon"></div>
            <div class="card-title">业务系统</div>
          </div>
          <div class="card purple">
            <div class="card-data">2024-08-10</div>
            <div class="card-icon"></div>
            <div class="card-title">实时数据</div>
            <Transition name="slide-fade">
              <div class="card-increase">+100000</div>
            </Transition>
          </div>
          <div class="card">
            <div class="card-data">2024-08-10</div>
            <div class="card-icon"></div>
            <div class="card-title">业务系统</div>
          </div>
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
    linear-gradient(
      270deg,
      rgb(24 39 111 / 0%) 48%,
      rgb(22 69 210 / 70%) 99%
    );
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
    text-shadow: 0 2px 6px rgb(0 0 0 / 82%),
      0 1px 2px rgb(163 39 255 / 50%);
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
