<template>
  <div class="common-layout">
    <el-container>
      <el-container style="height: 100vh;">
		  <!-- padding: 8px 24px; -->
        <el-aside width="20%">
			<LeftAside/>
		</el-aside>
		<!-- -el-main-padding: 20px; -->
        <el-main >
			<!-- #eef1f6 -->
			<el-card style="height: 100%; width: 100%;">
				<!-- <el-header height="5vh" style="float: right;">Header</el-header> -->
				<ShowComponentData/>
			</el-card>
		</el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
	import { ref, provide } from 'vue';
	import LeftAside from './leftAside.vue'
	import ShowComponentData from './parts/showComponentData.vue'
	import useSettingsStore from '@/store/modules/settings'

	const settingsStore = useSettingsStore()
	const theme = computed(() => settingsStore.theme);
	
	const categroyId = ref(0);
	const updateCategroyId = (newValue) => (categroyId.value = newValue);
	provide('categroyId', categroyId);
	provide('updateCategroyId', updateCategroyId);
	
	const companyId = ref(0);
	const updateCompanyId = (newValue) => (companyId.value = newValue);
	provide('companyId', companyId);
	provide('updateCompanyId', updateCompanyId);
	
	const selectedAttributeShow = ref(0);
	const updateSelectedAttributeShow = (newValue) => (selectedAttributeShow.value = newValue);
	provide('selectedAttributeShow', selectedAttributeShow);
	provide('updateSelectedAttributeShow', updateSelectedAttributeShow);
	
	const selectShowAttrList = ref([]);
	const updateSelectShowAttrList = (newValue) => (selectShowAttrList.value = newValue);
	provide('selectShowAttrList', selectShowAttrList);
	provide('updateSelectShowAttrList', updateSelectShowAttrList);
	
	const componentDataFilterFile = ref(null)
	const updateComponentDataFilterFile = (newValue) => (componentDataFilterFile.value = newValue);
	provide('componentDataFilterFile', componentDataFilterFile);
	provide('updateComponentDataFilterFile', updateComponentDataFilterFile);
	
	const firstFilter = ref(false);
	const updateFirstFilter = (newValue) => (firstFilter.value = newValue);
	provide('firstFilter', firstFilter);
	provide('updateFirstFilter', updateFirstFilter);

	const secondFilter = ref(false);
	const updateSecondFilter = (newValue) => (secondFilter.value = newValue);
	provide('secondFilter', secondFilter);
	provide('updateSecondFilter', updateSecondFilter);
</script>

<style lang="scss" scoped>
	@import "@/assets/styles/mixin.scss";
	@import "@/assets/styles/variables.module.scss";

	main {
		background-color: #eef1f6;
		padding: 8px 10px 8px 0px;
	}

	aside {
		margin-bottom: 0px;
		padding: 8px 10px 8px 10px;
	}

	.common-layout {
	  position: relative;
	  height: 100%;
	  width: 100%;
	}

	.list-wrapper {
	  position: relative;
	  clear: both; /* 清除左侧和右侧浮动，确保从右边第一行开始 */
	  height: 100vh;
	  width: 75%;
	  float: right;
	  background-color: gray;
	}

	.company-wrapper {
	  position: relative;
	  float: left;
	  height: 20vh;
	  width: 25%;
	  background-color: red;
	}

	.search-wrapper {
	  position: relative;
	  float: left;
	  clear: left; /* 阻止这个元素与左浮动元素同一行 */
	  height: 60vh;
	  width: 25%;
	  background-color: green;
	}

	.concat-wrapper {
	  position: relative;
	  float: left;
	  clear: left;
	  height: 20vh;
	  width: 25%;
	  background-color: blue;
	}



</style>