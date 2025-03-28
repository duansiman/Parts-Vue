<template>
	<div
        class="selectCategroy"
        style="border: 1px solid gainsboro; padding: 8px; display: flex; justify-content: space-between; align-items: center;">
		部件类型 <el-text>{{selectedCategoryName}}</el-text>
		<el-button plain @click="selectCategroy">选择</el-button>
		
		<!-- 添加或修改部件公司信息对话框 -->
		<el-dialog  class="selectCategroyDialog" v-model="selectData.open" width="600px" append-to-body>
			<template #header>
			  <div style="display: flex; justify-content: space-between; align-items: center;">
				<h3>{{selectData.title}}</h3>
				<el-input style="width: 50%;" :prefix-icon="Search" v-model="selectData.search"></el-input>	  
			</div>
			</template>
			<el-scrollbar height="400px">
				<el-row :gutter="10" class="mb8">
				  <el-radio-group v-model="selectedCategory" size="large" @change="changeCategory">
					<el-col :span="1.5" v-for="categroy in categoryFilterList" >
					  <el-radio-button 
						class="categroyButton"
						:label="categroy.name"
						:key="categroy.id" 
						:value="categroy.id">
					  </el-radio-button>
					</el-col>
				  </el-radio-group>
				</el-row>
			</el-scrollbar>
		</el-dialog>
	</div>
</template>

<script setup name="SelectCategroy">
	import { computed } from 'vue';
	import { inject } from 'vue';
	import { listCategory } from "@/api/parts/user/userCategory";
	import HeaderSearch from '@/components/HeaderSearch'
	import { Calendar, Search } from '@element-plus/icons-vue'
	
	const { proxy } = getCurrentInstance();
	const { checkLogin } = proxy.loginService();
	
		
	// 选择弹窗
	const selectData = reactive({
	  // 是否显示弹出层（用户导入）
	  open: false,
	  // 弹出层标题（用户导入）
	  title: "选择部件类型",
	  search: ""
	});
	function selectCategroy() {
		if(checkLogin()) {
			selectData.open = true;
		}
	}
	
	function changeCategory() {
		selectData.open = false;
	}
	
	// 分类相关
	const categoryList = ref([]);
	const selectedCategory = ref(0);
	const selectedCategoryName = computed(() => {
		return categoryList.value.find(a => a.id === selectedCategory.value)?.name || '';
	});
	function getCategoryList() {
	  const queryParams = {
	    pageNum: 1,
	    pageSize: 1000
	  }
	  
	  listCategory(queryParams).then(response => {
	    categoryList.value = response.rows;
		selectedCategory.value = categoryList.value[0].id;
		console.log("selectedCategory:", selectedCategory.value);
	  });
	}
	getCategoryList();
	const categoryFilterList = computed(() => {
		return categoryList.value.filter((item) => item.name.includes(selectData.search));
	});
	
	// 通知其他组件
	const updateCategroyId = inject('updateCategroyId');
	watch(selectedCategory, (newValue) => {
		if (newValue) {
			updateCategroyId(newValue)
		}
	});
	
</script>

<style>
	.selectCategroyDialog .el-col {
		margin-top: 5px;
		margin-bottom: 5px;
	}

</style>