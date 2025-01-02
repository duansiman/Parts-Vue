<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="部件类型名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入部件类型名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['parts:category:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['parts:category:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['parts:category:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['parts:category:export']"
        >导出</el-button>
      </el-col>
	  <el-col :span="1.5">
	     <el-button
	        type="info"
	        plain
	        icon="Upload"
	        @click="handleImport"
	        v-hasPermi="['parts:category:import']"
	     >导入部件类型</el-button>
	  </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="categoryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
	  <el-table-column label="部件类型序号" align="center" prop="seq" />
      <el-table-column label="部件类型名" align="center" prop="name" />
      <el-table-column label="部件类型描述" align="center" prop="description" />
	  <el-table-column label="产品组" align="center" prop="productGroup" />
	  <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['parts:category:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['parts:category:remove']">删除</el-button>
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

    <!-- 添加或修改部件类型信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="categoryRef" :model="form" :rules="rules" label-width="120px">
		  <el-form-item label="部件类型序号" prop="seq">
		    <el-input v-model="form.seq" placeholder="请输入部件类型序号" />
		  </el-form-item>
        <el-form-item label="部件类型名" prop="name">
          <el-input v-model="form.name" placeholder="请输入部件类型名" />
        </el-form-item>
        <el-form-item label="部件类型描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入部件类型描述" />
        </el-form-item>
		<el-form-item label="产品组" prop="productGroup">
		  <el-input v-model="form.productGroup" placeholder="请输入产品组" />
		</el-form-item>
		<el-form-item label="排序" prop="sort">
		  <el-input v-model="form.sort" placeholder="请输入排序等级" />
		</el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
	
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
	            <!-- <div class="el-upload__tip">
	               <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据
	            </div> -->
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
  </div>
</template>

<script setup name="Category">
import { getToken } from "@/utils/auth";
import { listCategory, getCategory, delCategory, addCategory, updateCategory } from "@/api/parts/category";

const { proxy } = getCurrentInstance();

const categoryList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(false);
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
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/parts/category/upload"
});

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    description: null,
    logo: null,
  },
  rules: {
	seq: [
	  { required: true, message: "部件类型序号不能为空", trigger: "blur" }
	],
    name: [
      { required: true, message: "部件类型名不能为空", trigger: "blur" }
    ],
    description: [
      { required: true, message: "部件类型描述不能为空", trigger: "blur" }
    ],
    logo: [
      { required: true, message: "部件图标不能为空", trigger: "blur" }
    ],
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
    updateTime: [
      { required: true, message: "更新时间不能为空", trigger: "blur" }
    ],
	productGroup: [
	  { required: true, message: "产品组不能为空", trigger: "blur" }
	]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询部件类型信息列表 */
function getList() {
  loading.value = true;
  listCategory(queryParams.value).then(response => {
    categoryList.value = response.rows;
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
    name: null,
    description: null,
    logo: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("categoryRef");
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
  title.value = "添加部件类型信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCategory(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改部件类型信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["categoryRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCategory(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCategory(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除部件类型信息编号为"' + _ids + '"的数据项？').then(function() {
    return delCategory(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('parts/category/export', {
    ...queryParams.value
  }, `category_${new Date().getTime()}.xlsx`)
}

/** 导入按钮操作 */
function handleImport() {
  upload.title = "部件类型导入";
  upload.open = true;
};

/** 下载模板操作 */
function importTemplate() {
  proxy.download("parts/category/uploadTemplate", {
  }, `category_template_${new Date().getTime()}.xlsx`);
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

getList();
</script>
