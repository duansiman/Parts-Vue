<template>
	<div
        class="radius"
        style="border: 1px solid">
		制造商
		<el-button plain @click="selectCompany">选择</el-button>
		
		<!-- 添加或修改部件公司信息对话框 -->
		<el-dialog :title="selectData.title" v-model="selectData.open" width="500px" append-to-body>
		  <el-row :gutter="10" class="mb8">
		    <el-col :span="1.5" v-for="company in companyList">
		      <ImagePreview :src="company.logo" width="100" height="100" />
		    </el-col>
		  </el-row>
		</el-dialog>
	</div>
</template>

<script setup name="SelectCompany">
	
	import { getToken } from "@/utils/auth";
	import { listCompany } from "@/api/parts/company";
	
	
	const companyList = ref([]);
	/*** 用户导入参数 */
	const selectData = reactive({
	  // 是否显示弹出层（用户导入）
	  open: false,
	  // 弹出层标题（用户导入）
	  title: ""
	});
	
	/** 新增按钮操作 */
	function selectCompany() {
	  selectData.open = true;
	  selectData.title = "选择筛选公司";
	  getCompanyList()
	}
	
	/** 查询部件公司信息列表 */
	function getCompanyList() {
	  const queryParams = {
	    pageNum: 1,
	    pageSize: 1000
	  }
	  
	  listCompany(queryParams).then(response => {
	    companyList.value = response.rows;
	    total.value = response.total;
	  });
	}
	
</script>

<style>
</style>