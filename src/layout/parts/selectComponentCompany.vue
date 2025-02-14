<template>
	<div
        class="radius"
        style="border: 1px solid gainsboro; margin-bottom: 8px;">
		<div style="width: 100%; padding: 8px;">
			<el-row>
				<el-col :span="7">制造商</el-col>
				<el-col :span="10" style="display: flex; justify-content: center; align-items: center;">
					<el-text style="margin-left: 5px;">
						{{selectedCompanyName}}
						<el-icon @click="goCompanyUrl" v-if="selectedCompanyName" style="margin-left: 5px;">
							<ChromeFilled />
						</el-icon>
					</el-text>
				</el-col>
				<el-col :span="7" style="display: flex; justify-content: flex-end;">
					<el-button plain @click="selectCompany">选择</el-button>
				</el-col>	
			</el-row>
		</div>
		

		
		<!-- 添加或修改部件公司信息对话框 -->
		<el-dialog :title="selectData.title" v-model="selectData.open" width="625px" append-to-body>
		  <el-row :gutter="10" class="mb8">
		    <el-radio-group v-model="selectedCompany" size="large" @change="changeCompany">  
			  <el-col :span="4.8" v-for="company in companyList" style="margin-bottom: 5px;">
				  <el-radio-button 
					:key="company.id" 
					:value="company.id">
					  <el-image :src="company.logo" style="width: 70px; height: 60px" /><br/>
					  <el-text>{{ company.name }}</el-text>
				  </el-radio-button>
			  </el-col>
		    </el-radio-group>

		  </el-row>
		</el-dialog>
	</div>
</template>

<script setup>
	import { computed, inject } from 'vue';
	import { ElNotification , ElMessageBox, ElMessage, ElLoading } from 'element-plus'
	
	import { listCompany } from "@/api/parts/company";
	import loginNotifyStore from '@/store/modules/loginNotify'
	
	const { proxy } = getCurrentInstance();
	const { loginName, isLogin, logout, login, getInfo } = proxy.loginService();
	
	// 选择弹窗
	const selectData = reactive({
	  // 是否显示弹出层（用户导入）
	  open: false,
	  // 弹出层标题（用户导入）
	  title: ""
	});
	function selectCompany() {
		if(!isLogin.value) {
			ElMessageBox
				.confirm('请先登录账户', '系统提示', { confirmButtonText: '登录', cancelButtonText: '取消', type: 'warning' })
				.then(() => {
					// loginNotifyStore().show()
					const loginNotify = loginNotifyStore();
					loginNotify.show();
					console.log("loginNotifyStore", loginNotify.flag)
				});
			return;
		}
		
		selectData.open = true;
		selectData.title = "选择制造商";
	}
	
	function changeCompany() {
		selectData.open = false;
	}
	
	// 公司相关
	const companyList = ref([]);
	const selectedCompany = ref(0);
	const selectedCompanyName = computed(() => {
		return companyList.value.find(a => a.id === selectedCompany.value)?.name || '';
	});
	function getCompanyList() {
	  const queryParams = {
	    pageNum: 1,
	    pageSize: 1000
	  }
	  
	  listCompany(queryParams).then(response => {
	    companyList.value = response.rows;
		selectedCompany.value = companyList.value[0].id;
		for(const company of companyList.value) {
			company.logo = import.meta.env.VITE_APP_BASE_API + company.logo;
		}
	  });
	}
	getCompanyList();
	
	// 显示组件
	function goCompanyUrl() {
	  const url = companyList.value.find(a => a.id === selectedCompany.value)?.website || '';
	  window.open(url, '_blank'); // '_blank' 表示在新窗口中打开
	}
	
	// 通知其他组件
	const updateCompanyId = inject('updateCompanyId');
	watch(selectedCompany, (newValue) => {
		if (newValue) {
			updateCompanyId(newValue)
		}
	});
	
</script>

<style>
	.el-radio-button.is-focus .el-radio-button__inner {
	  background-color: lightgray; /* 自定义橙色背景 */
	}
	.el-radio-button.is-active .el-radio-button__inner {
	  background-color: lightgray; /* 自定义橙色背景 */
	}
</style>