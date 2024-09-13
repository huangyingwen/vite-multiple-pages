<script setup lang="ts">
import HotMap from './HotMap.vue';
import HotMapScreen from './HotMapScreen.vue';
import qs from 'qs';

const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
const screen = query.screen;
</script>

<template>
  <HotMap v-if="screen !== '1'" />
  <HotMapScreen v-else />
</template>

<style lang="less">
html,
body,
.rootcon {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0 !important;
}
</style>
