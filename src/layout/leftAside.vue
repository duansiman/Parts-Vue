<template>
  <div class="parent-container">
    <el-row type="flex" class="full-height">
      <el-col class="child-box-1" style="background-color: aqua;">
        <el-card style="height: 100%; width: 100%;">
          <ShowSystemCompany/>
        </el-card>
      </el-col>
      <el-col class="child-box-2" style="margin-top: 8px; margin-bottom: 8px;">
        <el-card style="height: 100%; width: 100%;">
			<el-tabs @tab-click="handleClick">
			  <el-tab-pane label="过滤条件1">
				  <SelectComponentCompany/>
				  <SelectComponentCategory/>
				  <SelectComponentAttr/>
			  </el-tab-pane>
			  <el-tab-pane label="过滤条件2">
				  <SelectUploadComponent/>
			  </el-tab-pane>
			</el-tabs>
        </el-card>
      </el-col>
	  <!-- <el-col class="child-box-2" style="margin-bottom: 8px;">
	    <el-card style="height: 100%; width: 100%;">
			<SelectUploadComponent/>
		</el-card>
	  </el-col> -->
      <el-col class="child-box-1">
        <el-card style="height: 100%; width: 100%;">
          <label>邮箱：</label>xxx@email.com<br/>
          <label>联系地址：</label>xxx
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script lang="ts" setup>
	import ShowSystemCompany from './parts/showSystemCompany.vue'
	import SelectComponentCompany from './parts/selectComponentCompany.vue'
	import SelectComponentCategory from './parts/selectComponentCategory.vue'
	import SelectComponentAttr from './parts/selectComponentAttr.vue';
	import SelectUploadComponent from './parts/selectUploadComponent.vue';
	import { computed, inject, watch } from 'vue';
	
	const updateFirstFilter = inject('updateFirstFilter');
	const updateSecondFilter = inject('updateSecondFilter');
	const handleClick = (tab, event) => {
		console.log(tab, event)
		if(tab.index == "0") {
			updateFirstFilter(true)
			updateSecondFilter(false)
		} else {
			updateFirstFilter(false)
			updateSecondFilter(true)
		}
	}
</script>

<style scoped>
	/* 父容器，使用 flex 布局并占满可用空间 */
	.parent-container {
	  display: flex;
	  height: 100%; /* 占满整个视口高度 */
	}

	/* 让 el-row 占满父组件的高度 */
	.full-height {
	  flex: 1;
	  flex-direction: column; /* 垂直布局 */
	}

	/* 子元素平分父容器的高度 */
	.child-box-1 {
	  flex: 1;
	  display: flex;
	  justify-content: center; /* 水平居中 */
	  align-items: center; /* 垂直居中 */
	  margin: 0px;
	}

	.child-box-2 {
	  flex: 1.5;
	  display: flex;
	  justify-content: center; /* 水平居中 */
	  align-items: center; /* 垂直居中 */
	  margin: 0px;
	}
</style>
