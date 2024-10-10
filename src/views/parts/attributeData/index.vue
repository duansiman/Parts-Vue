<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="部件分类ID" prop="componentDataId">
        <el-input
          v-model="queryParams.componentDataId"
          placeholder="请输入部件分类ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="部件公司ID" prop="attrId">
        <el-input
          v-model="queryParams.attrId"
          placeholder="请输入部件公司ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="属性值" prop="attrValue">
        <el-input
          v-model="queryParams.attrValue"
          placeholder="请输入属性值"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="最小数字属性" prop="attrValueMin">
        <el-input
          v-model="queryParams.attrValueMin"
          placeholder="请输入最小数字属性"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="最大数字属性" prop="attrValueMax">
        <el-input
          v-model="queryParams.attrValueMax"
          placeholder="请输入最大数字属性"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="数字属性" prop="attrValueNum">
        <el-input
          v-model="queryParams.attrValueNum"
          placeholder="请输入数字属性"
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
          v-hasPermi="['parts:attributeData:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['parts:attributeData:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['parts:attributeData:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['parts:attributeData:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="attributeDataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="自增ID" align="center" prop="id" />
      <el-table-column label="部件分类ID" align="center" prop="componentDataId" />
      <el-table-column label="部件公司ID" align="center" prop="attrId" />
      <el-table-column label="属性值" align="center" prop="attrValue" />
      <el-table-column label="最小数字属性" align="center" prop="attrValueMin" />
      <el-table-column label="最大数字属性" align="center" prop="attrValueMax" />
      <el-table-column label="列表属性" align="center" prop="attrValueList" />
      <el-table-column label="数字属性" align="center" prop="attrValueNum" />
      <el-table-column label="图片属性" align="center" prop="attrValueImage" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.attrValueImage" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="文件属性" align="center" prop="attrValueFile" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['parts:attributeData:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['parts:attributeData:remove']">删除</el-button>
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

    <!-- 添加或修改部件属性数据对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="attributeDataRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="部件分类ID" prop="componentDataId">
          <el-input v-model="form.componentDataId" placeholder="请输入部件分类ID" />
        </el-form-item>
        <el-form-item label="部件公司ID" prop="attrId">
          <el-input v-model="form.attrId" placeholder="请输入部件公司ID" />
        </el-form-item>
        <el-form-item label="属性值" prop="attrValue">
          <el-input v-model="form.attrValue" placeholder="请输入属性值" />
        </el-form-item>
        <el-form-item label="最小数字属性" prop="attrValueMin">
          <el-input v-model="form.attrValueMin" placeholder="请输入最小数字属性" />
        </el-form-item>
        <el-form-item label="最大数字属性" prop="attrValueMax">
          <el-input v-model="form.attrValueMax" placeholder="请输入最大数字属性" />
        </el-form-item>
        <el-form-item label="数字属性" prop="attrValueNum">
          <el-input v-model="form.attrValueNum" placeholder="请输入数字属性" />
        </el-form-item>
        <el-form-item label="图片属性" prop="attrValueImage">
          <image-upload v-model="form.attrValueImage"/>
        </el-form-item>
        <el-form-item label="文件属性" prop="attrValueFile">
          <file-upload v-model="form.attrValueFile"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="AttributeData">
import { listAttributeData, getAttributeData, delAttributeData, addAttributeData, updateAttributeData } from "@/api/parts/attributeData";

const { proxy } = getCurrentInstance();

const attributeDataList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    componentDataId: null,
    attrId: null,
    attrValue: null,
    attrValueMin: null,
    attrValueMax: null,
    attrValueList: null,
    attrValueNum: null,
    attrValueImage: null,
    attrValueFile: null,
  },
  rules: {
    componentDataId: [
      { required: true, message: "部件分类ID不能为空", trigger: "blur" }
    ],
    attrId: [
      { required: true, message: "部件公司ID不能为空", trigger: "blur" }
    ],
    attrValue: [
      { required: true, message: "属性值不能为空", trigger: "blur" }
    ],
    attrValueMin: [
      { required: true, message: "最小数字属性不能为空", trigger: "blur" }
    ],
    attrValueMax: [
      { required: true, message: "最大数字属性不能为空", trigger: "blur" }
    ],
    attrValueList: [
      { required: true, message: "列表属性不能为空", trigger: "blur" }
    ],
    attrValueNum: [
      { required: true, message: "数字属性不能为空", trigger: "blur" }
    ],
    attrValueImage: [
      { required: true, message: "图片属性不能为空", trigger: "blur" }
    ],
    attrValueFile: [
      { required: true, message: "文件属性不能为空", trigger: "blur" }
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

/** 查询部件属性数据列表 */
function getList() {
  loading.value = true;
  listAttributeData(queryParams.value).then(response => {
    attributeDataList.value = response.rows;
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
    componentDataId: null,
    attrId: null,
    attrValue: null,
    attrValueMin: null,
    attrValueMax: null,
    attrValueList: null,
    attrValueNum: null,
    attrValueImage: null,
    attrValueFile: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("attributeDataRef");
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
  title.value = "添加部件属性数据";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getAttributeData(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改部件属性数据";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["attributeDataRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateAttributeData(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addAttributeData(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除部件属性数据编号为"' + _ids + '"的数据项？').then(function() {
    return delAttributeData(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('parts/attributeData/export', {
    ...queryParams.value
  }, `attributeData_${new Date().getTime()}.xlsx`)
}

getList();
</script>
