<template>
  <div class="common-layout">
    <el-container>
      <el-header height="5vh" :style="{ '--current-color': theme }">Header</el-header>
      <el-container style="height: 95vh;">
        <el-aside width="20%">
			<LeftAside/>
		</el-aside>
        <el-main >Main</el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import LeftAside from './leftAside.vue'
import useSettingsStore from '@/store/modules/settings'

const settingsStore = useSettingsStore()
const theme = computed(() => settingsStore.theme);

</script>

<style lang="scss" scoped>
  @import "@/assets/styles/mixin.scss";
  @import "@/assets/styles/variables.module.scss";

.common-layout {
  position: relative;
  height: 100%;
  width: 100%;
}

.list-wrapper {
  position: relative;
  clear: both; /* 清除左侧和右侧浮动，确保从右边第一行开始 */
  height: 100vh;
  width: 80%;
  float: right;
  background-color: gray;
}

.company-wrapper {
  position: relative;
  float: left;
  height: 20vh;
  width: 20%;
  background-color: red;
}

.search-wrapper {
  position: relative;
  float: left;
  clear: left; /* 阻止这个元素与左浮动元素同一行 */
  height: 60vh;
  width: 20%;
  background-color: green;
}

.concat-wrapper {
  position: relative;
  float: left;
  clear: left;
  height: 20vh;
  width: 20%;
  background-color: blue;
}



</style>