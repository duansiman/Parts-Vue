<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="部件编号" prop="componentId">
        <el-input
          v-model="queryParams.componentId"
          placeholder="请输入部件编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="部件分类" prop="categoryId">
		  <el-select
		     v-model="queryParams.categoryId"
		     placeholder="选择部件分类"
		     style="width: 200px;"
			 @keyup.enter="handleQuery"
		  >
		     <el-option
		  	  v-for="category in categoryList"
		  	  :key="category.id"
		  	  :label="category.name"
		  	  :value="category.id"
		     />
		  </el-select>
      </el-form-item>
      <el-form-item label="部件公司" prop="companyId">
		  <el-select
		     v-model="queryParams.companyId"
		     placeholder="选择部件公司"
		     clearable
		     style="width: 200px;"
		  	@keyup.enter="handleQuery"
		  >
		     <el-option
		  	  v-for="company in companyList"
		  	  :key="company.id"
		  	  :label="company.name"
		  	  :value="company.id"
		     />
		  </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['parts:componentData:remove']"
        >删除</el-button>
      </el-col>
	  <el-col :span="1.5">
	     <el-button
	        type="info"
	        plain
	        icon="Upload"
	        @click="handleImport"
	        v-hasPermi="['parts:componentData:import']"
	     >导入部件数据</el-button>
	  </el-col>
	  <el-col :span="1.5">
	     <el-button
	        type="info"
	        plain
	        icon="Upload"
	        @click="handleEplImport"
	        v-hasPermi="['parts:componentData:eplImport']"
	     >导入EPL数据</el-button>
	  </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading"  :data="componentDataList" border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
		
		<el-table-column
			v-for="(attr, index) in categoryAttributeList"
			:key="attr.attrId"
			:label="attr.attrName"
			:title="attr.attrName"
			align="center"
			show-overflow-tooltip
		>
	        <template #default="scope">
				<div class="componentValue" style="width: 100%; height: 150px;">
					<ImagePreview v-if="attr.attrType == 'Image'" :src="getAttrValue(scope.row.attrs, attr.attrId)" width="100%" height="100%" />
					<el-text  v-if="attr.attrType !== 'Image'" >{{ getAttrValue(scope.row.attrs, attr.attrId) }}</el-text>
				</div>
				
	        </template>
	      </el-table-column>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['parts:componentData:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['parts:componentData:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
	
	<!-- 用户导入对话框 -->
	<el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
		<el-select
		   v-show="upload.showSelectCategory"
		   v-model="upload.categoryId"
		   placeholder="选择部件分类"
		   style="width: 240px; margin-bottom: 10px;"
		>
		   <el-option
			  v-for="category in categoryList"
			  :key="category.id"
			  :label="category.name"
			  :value="category.id"
		   />
		</el-select>
	   <el-upload
	      ref="uploadRef"
	      :limit="1"
	      accept=".xlsx, .xls, .zip"
	      :headers="upload.headers"
	      :action="upload.url + '?categoryId=' + upload.categoryId"
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
	            <!-- <div class="el-upload__tip">
	               <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据
	            </div> -->
	            <span>{{upload.fileType}}</span>
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
  </div>
</template>

<script setup name="ComponentData">
import { listCategory } from "@/api/parts/category";
import { listComponentData, getComponentData, delComponentData, addComponentData, updateComponentData } from "@/api/parts/componentData";
import { listCompany } from "@/api/parts/company";
import { getToken } from "@/utils/auth";
import { listCategoryAttribute } from "@/api/parts/categoryAttribute";



const { proxy } = getCurrentInstance();

const componentDataList = ref([]);
const categoryList = ref([]);
const companyList = ref([]);
const categoryAttributeList = ref([]);


const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  categoryId: 0,
  fileType: "",
  showSelectCategory: true,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/parts/componentData/upload"
});

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
	allAttr: true,
    componentId: null,
    categoryId: null,
    companyId: null,
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

const { queryParams, form, rules } = toRefs(data);

/** 查询部件数据列表 */
function getList() {
  loading.value = true;
  listComponentData(queryParams.value).then(response => {
	categoryAttributeList.value = response.data.attrItems;
    componentDataList.value = response.data.dataItems;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    componentId: null,
    categoryId: null,
    companyId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("componentDataRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加部件数据";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getComponentData(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改部件数据";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["componentDataRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateComponentData(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addComponentData(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除部件数据编号为"' + _ids + '"的数据项？').then(function() {
    return delComponentData(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('parts/componentData/export', {
    ...queryParams.value
  }, `componentData_${new Date().getTime()}.xlsx`)
}

// 获取特定 attr 的值
const getAttrValue = (attrs, attrId) => {
  const attr = attrs.find(a => a.attrId === attrId);
  return attr ? attr.attrValue : '';
};

/** 导入按钮操作 */
function handleImport() {
  upload.title = "部件数据导入";
  upload.open = true;
  upload.fileType  = "仅允许导入xls、xlsx格式文件。";
};

function handleEplImport() {
  upload.title = "部件数据导入";
  upload.open = true;
  upload.showSelectCategory = false;
  upload.fileType  = "仅允许导入zip格式文件。";
  upload.url = import.meta.env.VITE_APP_BASE_API + "/parts/componentData/eplUpload"
};


/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};

/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  proxy.$refs["uploadRef"].handleRemove(file);
  proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
  getList();
};

/** 提交上传文件 */
function submitFileForm() {
  proxy.$refs["uploadRef"].submit();
};

listCategory({
    pageNum: 1,
    pageSize: 10000
  }).then(response => {
  categoryList.value = response.rows;
  queryParams.value.categoryId = response.rows[0].id
  upload.categoryId = response.rows[0].id
  getList();
});

listCompany({
    pageNum: 1,
    pageSize: 10000
  }).then(response => {
    companyList.value = response.rows;
  });
</script>
