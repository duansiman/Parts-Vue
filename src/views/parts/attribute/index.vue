<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="属性名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入属性名称"
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
          v-hasPermi="['parts:attribute:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['parts:attribute:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['parts:attribute:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['parts:attribute:export']"
        >导出</el-button>
      </el-col>
	  <!-- <el-col :span="1.5">
	     <el-button
	        type="info"
	        plain
	        icon="Upload"
	        @click="handleImport"
	        v-hasPermi="['/parts:attribute:import']"
	     >导入属性名</el-button>
	  </el-col> -->
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="attributeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="属性名称" align="center" prop="name" />
      <el-table-column label="属性描述" align="center" prop="description" />
      <el-table-column label="属性类型" align="center" prop="type" />
	  <el-table-column label="是否为功能模版属性" align="center" prop="funcTemplateAttr" />
	  <el-table-column label="是否可见" align="center" prop="visible" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['parts:attribute:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['parts:attribute:remove']">删除</el-button>
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

    <!-- 添加或修改部件属性信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="attributeRef" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="属性名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入属性名称" />
        </el-form-item>
        <el-form-item label="属性描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入属性描述" />
        </el-form-item>
		<el-form-item label="属性类型" prop="type">
		  <el-input v-model="form.type" placeholder="请输入属性类型" />
		</el-form-item>
		<el-form-item label="是否为功能模版属性" prop="type">
		  <el-input v-model="form.funcTemplateAttr" placeholder="请输入是否为功能模版属性" />
		</el-form-item>
		<el-form-item label="是否可见" prop="type">
		  <el-input v-model="form.visible" placeholder="请输入是否可见" />
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

<script setup name="Attribute">
import { getToken } from "@/utils/auth";
import { listAttribute, getAttribute, delAttribute, addAttribute, updateAttribute } from "@/api/parts/attribute";

const { proxy } = getCurrentInstance();

const attributeList = ref([]);
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
  url: import.meta.env.VITE_APP_BASE_API + "/parts/attribute/upload"
});

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    description: null,
    type: null,
  },
  rules: {
    name: [
      { required: true, message: "属性名称不能为空", trigger: "blur" }
    ],
    description: [
      { required: true, message: "属性描述不能为空", trigger: "blur" }
    ],
    type: [
      { required: true, message: "属性类型不能为空", trigger: "change" }
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

/** 查询部件属性信息列表 */
function getList() {
  loading.value = true;
  listAttribute(queryParams.value).then(response => {
    attributeList.value = response.rows;
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
    type: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("attributeRef");
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
  title.value = "添加部件属性信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getAttribute(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改部件属性信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["attributeRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateAttribute(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addAttribute(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除部件属性信息编号为"' + _ids + '"的数据项？').then(function() {
    return delAttribute(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('parts/attribute/export', {
    ...queryParams.value
  }, `attribute_${new Date().getTime()}.xlsx`)
}
/** 导入按钮操作 */
function handleImport() {
  upload.title = "部件类型导入";
  upload.open = true;
};

/** 下载模板操作 */
function importTemplate() {
  proxy.download("parts/attribute/uploadTemplate", {
  }, `attribute_template_${new Date().getTime()}.xlsx`);
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
