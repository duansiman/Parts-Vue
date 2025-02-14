<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="公司名称缩写" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入公司名称缩写"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="英文名称" prop="nameEn">
        <el-input
          v-model="queryParams.nameEn"
          placeholder="请输入英文名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="英文全称" prop="fullNameEn">
        <el-input
          v-model="queryParams.fullNameEn"
          placeholder="请输入英文全称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="中文名称" prop="nameCn">
        <el-input
          v-model="queryParams.nameCn"
          placeholder="请输入中文名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="中文全称" prop="fullNameCn">
        <el-input
          v-model="queryParams.fullNameCn"
          placeholder="请输入中文全称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="公司图标" prop="logo">
        <el-input
          v-model="queryParams.logo"
          placeholder="请输入公司图标"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="网址" prop="website">
        <el-input
          v-model="queryParams.website"
          placeholder="请输入网址"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="注册地或国籍" prop="registrationPlace">
        <el-input
          v-model="queryParams.registrationPlace"
          placeholder="请输入注册地或国籍"
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
          v-hasPermi="['parts:company:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['parts:company:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['parts:company:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['parts:company:export']"
        >导出</el-button>
      </el-col>
	  <el-col :span="1.5">
	     <el-button
	        type="info"
	        plain
	        icon="Upload"
	        @click="handleCompanyImport"
	        v-hasPermi="['parts:company:import']"
	     >导入公司</el-button>
	  </el-col>
	  <el-col :span="1.5">
	     <el-button
	        type="info"
	        plain
	        icon="Upload"
	        @click="handleLogoImport"
	        v-hasPermi="['parts:company:logo:import']"
	     >导入公司logo</el-button>
	  </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="companyList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="公司名称缩写" align="center" prop="name" />
      <el-table-column label="英文名称" align="center" prop="nameEn" />
      <el-table-column label="英文全称" align="center" prop="fullNameEn" />
      <el-table-column label="中文名称" align="center" prop="nameCn" />
      <el-table-column label="中文全称" align="center" prop="fullNameCn" />
      <!-- <el-table-column label="公司图标" align="center" prop="logo" /> -->
	  <el-table-column label="公司图标" align="center">
	  		  <template v-slot="scope">
	  			<ImagePreview :src="scope.row.logo" width="100" height="100" />
	  		  </template>
	  </el-table-column>
      <el-table-column label="网址" align="center" prop="website" />
      <el-table-column label="注册地或国籍" align="center" prop="registrationPlace" />
	  <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['parts:company:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['parts:company:remove']">删除</el-button>
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

    <!-- 添加或修改部件公司信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="companyRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="公司名称缩写" prop="name">
          <el-input v-model="form.name" placeholder="请输入公司名称缩写" />
        </el-form-item>
        <el-form-item label="英文名称" prop="nameEn">
          <el-input v-model="form.nameEn" placeholder="请输入英文名称" />
        </el-form-item>
        <el-form-item label="英文全称" prop="fullNameEn">
          <el-input v-model="form.fullNameEn" placeholder="请输入英文全称" />
        </el-form-item>
        <el-form-item label="中文名称" prop="nameCn">
          <el-input v-model="form.nameCn" placeholder="请输入中文名称" />
        </el-form-item>
        <el-form-item label="中文全称" prop="fullNameCn">
          <el-input v-model="form.fullNameCn" placeholder="请输入中文全称" />
        </el-form-item>
        <el-form-item label="公司图标" prop="logo">
          <el-input v-model="form.logo" placeholder="请输入公司图标" />
        </el-form-item>
        <el-form-item label="网址" prop="website">
          <el-input v-model="form.website" placeholder="请输入网址" />
        </el-form-item>
        <el-form-item label="注册地或国籍" prop="registrationPlace">
          <el-input v-model="form.registrationPlace" placeholder="请输入注册地或国籍" />
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
	            <el-link v-show="upload.showTemplate" type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
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

<script setup name="Company">
import { getToken } from "@/utils/auth";
import { listCompany, getCompany, delCompany, addCompany, updateCompany } from "@/api/parts/company";

const { proxy } = getCurrentInstance();

const companyList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(false);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

/*** 用户导入参数 */
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
  url: "/parts/company/upload",
  showTemplate: false
});

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    nameEn: null,
    fullNameEn: null,
    nameCn: null,
    fullNameCn: null,
    logo: null,
    website: null,
    registrationPlace: null,
  },
  rules: {
    name: [
      { required: true, message: "公司名称缩写不能为空", trigger: "blur" }
    ],
    nameEn: [
      { required: true, message: "英文名称不能为空", trigger: "blur" }
    ],
    fullNameEn: [
      { required: true, message: "英文全称不能为空", trigger: "blur" }
    ],
    nameCn: [
      { required: true, message: "中文名称不能为空", trigger: "blur" }
    ],
    fullNameCn: [
      { required: true, message: "中文全称不能为空", trigger: "blur" }
    ],
    logo: [
      { required: true, message: "公司图标不能为空", trigger: "blur" }
    ],
    website: [
      { required: true, message: "网址不能为空", trigger: "blur" }
    ],
    registrationPlace: [
      { required: true, message: "注册地或国籍不能为空", trigger: "blur" }
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

/** 查询部件公司信息列表 */
function getList() {
  loading.value = true;
  listCompany(queryParams.value).then(response => {
    companyList.value = response.rows;
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
    nameEn: null,
    fullNameEn: null,
    nameCn: null,
    fullNameCn: null,
    logo: null,
    website: null,
    registrationPlace: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("companyRef");
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
  title.value = "添加部件公司信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCompany(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改部件公司信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["companyRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCompany(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCompany(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除部件公司信息编号为"' + _ids + '"的数据项？').then(function() {
    return delCompany(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('parts/company/export', {
    ...queryParams.value
  }, `company_${new Date().getTime()}.xlsx`)
}

/** 导入按钮操作 */
function handleCompanyImport() {
  upload.title = "公司导入";
  upload.open = true;
  upload.url = import.meta.env.VITE_APP_BASE_API + '/parts/company/upload';
  upload.showTemplate = true;
};

/** 导入按钮操作 */
function handleLogoImport() {
  upload.title = "公司Logo导入";
  upload.open = true;
  upload.url = import.meta.env.VITE_APP_BASE_API + '/parts/company/logo/upload';
  upload.showTemplate = false;
};

/** 下载模板操作 */
function importTemplate() {
  proxy.download("parts/company/uploadTemplate", {
  }, `company_template_${new Date().getTime()}.xlsx`);
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
