<template>
  <div class="showComponentDataContainer" style="height: 95vh;">
	  
    <el-table v-loading="loading" 
		:data="componentDataList"
		@select-all="handleSelectAll"
		@select="handleSelect"
		border
		>
		<el-table-column v-if="categoryAttributeList.length!=0 && isVIP" type="selection" width="55" align="center" />
		
	  <!-- 动态生成列 -->
	      <el-table-column
	        v-for="(colunm, index) in categoryAttributeList"
	        :key="colunm.attrId"
	        :label="colunm.attrName"
			:title="colunm.attrName"
	        align="center"
			show-overflow-tooltip
	      >
			<template #header>
				<div style="width: 100%; height: 100%; padding: 0px; margin: 0px;">
					<el-row>
						<el-col :span="18" style="display: flex; align-items: center;">
							<el-tooltip effect="dark" :content="colunm.attrName" placement="top">
							  <span style="text-overflow: clip; white-space: nowrap; overflow: hidden; width: 100%;max-width: 100%;">{{ colunm.attrName }}</span>
							</el-tooltip>
						</el-col>
						<el-col :span="6" style="display: flex; justify-content: flex-end; align-items: center;">
							<el-icon>
								<ArrowDown v-if="colunm.attrId != queryParams.searchAttrId" @click="clickFilter(colunm)" />
								<ArrowUp v-if="colunm.attrId == queryParams.searchAttrId" @click="clickFilter(colunm)" style="background-color: lightblue;"/>
							</el-icon>
						</el-col>
					</el-row>
				</div>
			</template>
				
	        <template #default="scope">
				<div class="componentValue" style="width: 100%; height: 150px;">
					<ImagePreview v-if="colunm.attrType == 'Image'" :src="getAttrValue(scope.row.attrs, colunm.attrId)" :height="'100%'"/>
					<el-text v-if="colunm.attrType !== 'Image'">{{ getAttrValue(scope.row.attrs, colunm.attrId) }}</el-text>
				</div>
	        </template>
	    </el-table-column>
    </el-table>
    
	<div>
		<el-row type="flex" justify="start" align="middle" style="gap: 10px; margin: 20px 0px">
			<el-col style="flex: 0 0 auto;"><el-button type="primary" v-if="isVIP && showDownload" @click="downloadData">下载</el-button></el-col>
			<el-col style="flex: 1 1 auto;">
				<!-- <el-pagination
				  v-show="total>0"
				  v-model:current-page="pageProp.page"
				  v-model:page-size="pageProp.limit"
				  :page-sizes="pageProp.pageSizes"
				  :background="pageProp.background"
				  :layout="pageProp.layout"
				  :pager-count="pageProp.pagerCount"
				  :total="total"
				  @size-change="handleSizeChange"
				  @current-change="handleCurrentChange"
				/> -->
				<pagination
				  v-show="total>0"
				  :total="total"
				  v-model:page="queryParams.pageNum"
				  v-model:limit="queryParams.pageSize"
				  @pagination="getList"
				/>
			</el-col>
		</el-row>
	</div>
	
	<!-- 用户导入对话框 -->
	<el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
	   <el-upload
	      ref="uploadRef"
	      :limit="1"
	      accept=".xlsx, .xls, .zip"
	      :headers="upload.headers"
	      :action="upload.url + '?updateSupport=' + upload.updateSupport"
	      :disabled="upload.isUploading"
	      :on-progress="handleFileUploadProgress"
	      :on-success="handleFileSuccess"
	      :auto-upload="false"
	      drag
	   >
	      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
	      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
	      <template #tip>
	         <div class="el-upload__tip text-center">
	            <span>仅允许导入xls、xlsx、.zip格式文件。</span>
	            <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
	         </div>
	      </template>
	   </el-upload>
	   <template #footer>
	      <div class="dialog-footer">
	         <el-button type="primary" @click="submitFileForm">确 定</el-button>
	         <el-button @click="upload.open = false">取 消</el-button>
	      </div>
	   </template>
	</el-dialog>
	
	<el-dialog :title="filterDialog.title" v-model="filterDialog.open" width="400px" @closed="closedFilter" append-to-body>
		<div>
			<el-row v-show="filterDialog.showLike">
				<el-col><el-text size="large">模糊匹配</el-text></el-col>
				<el-col><el-input type="text" v-model="filterDialog.likeValue"></el-input></el-col>
			</el-row>
			<el-row v-show="filterDialog.showRange">
				<el-col><el-text size="large">最小值</el-text></el-col>
				<el-col><el-input type="number"  v-model="filterDialog.minValue"></el-input></el-col>
			</el-row>
			<el-row v-show="filterDialog.showRange">
				<el-col><el-text size="large">最大值</el-text></el-col>
				<el-col><el-input type="number"  v-model="filterDialog.maxValue"></el-input></el-col>
			</el-row>
		</div>
		<template #footer>
		   <div class="dialog-footer">
		      <el-button type="primary" @click="searchData">确 定</el-button>
		      <el-button @click="cancelSearchData">取 消</el-button>
		   </div>
		</template>
	</el-dialog>
  </div>
</template>

<script setup name="ShowComponentData">
	import { computed, inject, watch, nextTick } from 'vue';
	import { checkRole } from '@/utils/permission';
	
	import { listCategory } from "@/api/parts/user/userCategory";
	import { listComponentData, uploadFilterFile, downloadComponentData } from "@/api/parts/user/userComponentData";
	import { listCompany } from "@/api/parts/user/userCompany";
	import { getToken } from "@/utils/auth";
	import { showCategoryAttribute } from "@/api/parts/user/userCategoryAttributeShowList";

	const { proxy } = getCurrentInstance();
	const { loginName, isLogin, logout, login, getInfo } = proxy.loginService();
	
	const isVIP = computed(() => {
		return checkRole(['VIP']);
	});
	
	const showDownload = ref(false);
	
	function handleSizeChange(val) {
	}
	
	function handleCurrentChange(val) {
	}
	
	const filterDialog = reactive({
		  click: false,
		  // 是否显示弹出层（用户导入）
		  open: false,
		  // 弹出层标题（用户导入）
		  title: "属性过滤",
		  attrId: '',
		  showLike: false,
		  showRange: false
		});
		
	function closedFilter() {
		filterDialog.click = false;
	}
	
	const showFilter = computed (()=> {
		return colunm.attrId == data.queryParams.attrId
	});
	
	function clickFilter(colunm) {
		console.log("colunm", colunm)
		filterDialog.click = true;
		filterDialog.attrId = colunm.attrId;
		filterDialog.attrType = colunm.attrType;
		filterDialog.title = colunm.attrName + "过滤";
		filterDialog.showRange = colunm.attrType.includes("Number") || colunm.attrType.includes("Long") 
			|| colunm.attrType.includes("Double") || colunm.attrType.includes("Short");
		filterDialog.showLike = colunm.attrType.includes("String") || colunm.attrType.includes("TEXT")
			|| colunm.attrType.includes("文本") || colunm.attrType.includes("Text");
		filterDialog.open = true;
	}
	
	function searchData() {
		data.queryParams.searchAttrId = filterDialog.attrId;
		
		if(filterDialog.showRange) {
			data.queryParams.minValue = filterDialog.minValue;
			data.queryParams.maxValue = filterDialog.maxValue;
		} else {
			data.queryParams.likeValue = filterDialog.likeValue;
		}
		
		getList();
		filterDialog.open = false;
	}
	
	function cancelSearchData() {
		filterDialog.open = false;
		data.queryParams.searchAttrId = null;
		filterDialog.likeValue = null;
		filterDialog.minValue = null;
		filterDialog.maxValue = null;
		getList();
	}

	const tableData = ref({
		columns: [],
		datas: []
	})
	const componentDataList = ref([]);
	const categoryAttributeList = ref([]);
	const categoryList = ref([]);
	const companyList = ref([]);

	const open = ref(false);
	const loading = ref(true);
	const showSearch = ref(true);
	const ids = ref([]);
	const single = ref(true);
	const multiple = ref(true);
	const total = ref(0);
	const title = ref("");

	const pageProp = ref({
	  total: total.value,
	  page: 1,
	  limit: 20,
	  pageSizes: [10, 20, 30, 50],
	  // 移动端页码按钮的数量端默认值5
	  pagerCount: 5,
	  layout: 'total, sizes, prev, pager, next, jumper',
	  background: true,
	  autoScroll: true,
	  hidden: false
	})

	const data = reactive({
	  form: {},
	  queryParams: {
		pageNum: 1,
		pageSize: 10,
		allAttr: false,
		showAttrId: null,
		attrIds: null,
		componentId: null,
		categoryId: 0,
		companyId: 0,
		searchAttrId: null,
		likeValue: null,
		minValue: null,
		maxValue: null,
	  },
	  rules: {
		componentId: [
		  { required: true, message: "部件编号不能为空", trigger: "blur" }
		],
		categoryId: [
		  { required: true, message: "部件分类ID不能为空", trigger: "blur" }
		],
		companyId: [
		  { required: true, message: "部件公司ID不能为空", trigger: "blur" }
		],
		createTime: [
		  { required: true, message: "创建时间不能为空", trigger: "blur" }
		],
		updateTime: [
		  { required: true, message: "更新时间不能为空", trigger: "blur" }
		]
	  }
	});

	const upload = reactive({
		  // 是否显示弹出层（用户导入）
		  open: false,
		  // 弹出层标题（用户导入）
		  title: "",
		  // 是否禁用上传
		  isUploading: false,
		  // 是否更新已经存在的用户数据
		  updateSupport: 0,
		  // 设置上传的请求头部
		  headers: { Authorization: "Bearer " + getToken() },
		  // 上传的地址
		  url: import.meta.env.VITE_APP_BASE_API + "/parts/category/upload"
		});

	const { queryParams, form, rules } = toRefs(data);
	const previousSelections = ref([]);

	function handleSelectAll(selections) {
		console.log('全选操作，选中的行：', selections);
		previousSelections.value = selections;
		console.log("previousSelections size=", previousSelections.value.length);
		showDownload.value = previousSelections.value.length > 0;
	}

	function handleSelect(selection, row) {
		console.log('选中行操作，选中的行：', selection);
		console.log('当前选中的行数据：', row);
		
		previousSelections.value = selection;
		
		console.log("previousSelections size=", previousSelections.value.length);
		showDownload.value = previousSelections.value.length > 0;
	}
	
	function downloadData() {
		const ids = previousSelections.value.map((item) => item.id);
		const query = {
			dataIds: ids.join(',')
		}
		proxy.download("/parts/componentData/download", query, `items_${new Date().getTime()}.zip`);
	}

	function headerClick(column, index) {
		console.log('点击的表头列信息:', column);
		console.log('表头列索引:', index);
		upload.open = true;
	}
	
	const firstFilter = inject('firstFilter');
	watch(firstFilter, (newValue) => {
		console.log("showComponentData firstFilter", newValue)
		if (newValue && componentDataFilterFile.value) {
			getList();
		}
	});
	
	const secondFilter = inject('secondFilter');
	watch(secondFilter, (newValue) => {
		console.log("showComponentData secondFilter", newValue, componentDataFilterFile.value)
		if (newValue && componentDataFilterFile.value.raw) {
			uploadFilterFile(componentDataFilterFile.value.raw).then(response => {
				categoryAttributeList.value = response.data.attrItems;
				componentDataList.value = response.data.dataItems;
				total.value = response.total;
			});
		}
	});
	
	// 监听其他组件通知
	const categroyId = inject('categroyId');
	watch(categroyId, (newValue) => {
		if (newValue) {
			console.log('showComponentData received categoryId=', newValue);
			data.queryParams.categoryId = newValue;
			data.queryParams.attrIds = null;
			// getList()
		}
	});
	
	const companyId = inject('companyId');
	watch(companyId, (newValue) => {
		if (newValue) {
			console.log('showComponentData received companyId=', newValue);
			data.queryParams.companyId = newValue;
			getList();
		}
	});
	
	const selectedAttributeShow = inject('selectedAttributeShow');
	console.log("showComponentData selectedAttributeShow", selectedAttributeShow.value)
	watch(selectedAttributeShow, (newValue) => {
		console.log('showComponentData received selectedAttributeShow=', newValue);
		if (newValue && newValue != -1) {
			data.queryParams.showAttrId = newValue;
			data.queryParams.attrIds = null;
			getList();
		}
	});
	
	const selectShowAttrList = inject('selectShowAttrList');
	watch(selectShowAttrList, (newValue) => {
		if(newValue.length == 0) {
			data.queryParams.attrIds = null;
			return;
		}
		
		if (newValue) {
			console.log('showComponentData received selectShowAttrList=', JSON.stringify(newValue));
			data.queryParams.attrIds = JSON.stringify(newValue);
			data.queryParams.showAttrId = null;
			getList();
		}
	});
	
	const componentDataFilterFile = inject('componentDataFilterFile');
	watch(() => componentDataFilterFile.value, (newValue) => {
		if (newValue) {
			console.log('showComponentData received componentDataFilterFile=', newValue);
			uploadFilterFile(newValue.raw || newValue).then(response => {
				categoryAttributeList.value = response.data.attrItems;
				componentDataList.value = response.data.dataItems;
				total.value = response.total;
			});
		}
	}, { deep: true });


	// 列表数据
	function getList() {
	  loading.value = true;
	  listComponentData(queryParams.value).then(response => {
		categoryAttributeList.value = response.data.attrItems;
		componentDataList.value = response.data.dataItems;
		total.value = response.total;
		loading.value = false;
	  });
	}

	// 多选框选中数据
	function handleSelectionChange(selection) {
	  ids.value = selection.map(item => item.id);
	  single.value = selection.length != 1;
	  multiple.value = !selection.length;
	}

	// 获取特定 attr 的值
	const getAttrValue = (attrs, attrId) => {
	  const attr = attrs.find(a => a.attrId === attrId);
	  return attr ? attr.attrValue : '';
	};

	// 检查表头文本是否超出
	const isHeaderOverflow = (label) => {
	  const el = document.createElement('span');
	  el.style.visibility = 'hidden';
	  el.style.whiteSpace = 'nowrap';
	  el.style.position = 'absolute';
	  el.style.width = 'auto';
	  el.textContent = label;
	  document.body.appendChild(el);
	  const isOverflow = el.offsetWidth > 80; // 设定一个最大宽度值，假设为100px
	  document.body.removeChild(el);
	  return isOverflow;
	};
</script>

<style>
	.componentValue {
		white-space: normal; /* 允许文本换行 */
		overflow: hidden; /* 隐藏超出部分 */
		text-overflow: ellipsis; /* 超出部分显示省略号 */
	}
	
	.showComponentDataContainer .el-table__row {
	  height: 150px;
	  max-height: 150px;
	  line-height: 150px;
	}
	
	.showComponentDataContainer {
	  display: flex;
	  flex-direction: column; /* 垂直排列 */
	  width: 100%;
	}	

	.showComponentDataContainer th {
		border: 1px solid gainsboro;
	}

 	.showComponentDataContainer th .cell {
		height: 60px;
		line-height: 60px;
	}
	
	/* .el-table .el-table__cell {
		padding: 0px;
	} */
	
	.el-table .cell {
		padding: 0px 5px;
	}
		
	/* .pagination-wrapper {
	  display: flex;
	  justify-content: flex-start;
	  margin-top: 10px; 
	} */

</style>
