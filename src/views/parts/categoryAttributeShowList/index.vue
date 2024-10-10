<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="一组属性命名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入一组属性命名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="部件分类ID" prop="categoryId">
        <el-input
          v-model="queryParams.categoryId"
          placeholder="请输入部件分类ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-input
          v-model="queryParams.priority"
          placeholder="请输入优先级"
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
          v-hasPermi="['parts:categoryAttributeShowList:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['parts:categoryAttributeShowList:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['parts:categoryAttributeShowList:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['parts:categoryAttributeShowList:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="categoryAttributeShowListList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="分类名称" align="center" prop="categoryName" />
	  <el-table-column label="一组属性命名" align="center" prop="name" />
      <el-table-column label="属性列表" align="center">
		  <template #default="scope">
			  <el-select
			     v-model="scope.row.selectedName"
			     placeholder="所有属性"
			     clearable
			     style="width: 240px;"
			  >
			     <el-option
			  	  v-for="name in scope.row.attrNames"
			  	  :key="name"
			  	  :label="name"
			  	  :value="name"
			     />
			  </el-select>
		  </template>
	  </el-table-column>
      <el-table-column label="优先级" align="center" prop="priority" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['parts:categoryAttributeShowList:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['parts:categoryAttributeShowList:remove']">删除</el-button>
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

    <!-- 添加或修改部件类型显示属性配置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="categoryAttributeShowListRef" :model="form" :rules="rules" label-width="80px">
		  <el-form-item label="部件分类" prop="categoryId">
			  <el-select
				 v-model="form.categoryId"
				 placeholder="选择部件分类"
				 clearable
				 style="width: 240px;"
				  @change="handleCategoryChange"
			  >
				 <el-option
				  v-for="category in categoryList"
				  :key="category.id"
				  :label="category.name"
				  :value="category.id"
				 />
			  </el-select>
		  </el-form-item>
		  <el-form-item label="分类属性" prop="attrIds">
			  <el-select
				 v-model="form.attrIds"
				 placeholder="选择分类属性"
				 multiple
				 clearable
				 style="width: 240px;"
			  >
				 <el-option
				  v-for="categoryAttribute in categoryAttributeList"
				  :key="categoryAttribute.attrId"
				  :label="categoryAttribute.attrName"
				  :value="categoryAttribute.attrId"
				 />
			  </el-select>
		  </el-form-item>
        <el-form-item label="一组属性命名" prop="name">
          <el-input v-model="form.name" placeholder="请输入一组属性命名" />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input v-model="form.priority" placeholder="请输入优先级" />
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

<script setup name="CategoryAttributeShowList">
import { listCategory } from "@/api/parts/category";
import { listCategoryAttributeShowList, getCategoryAttributeShowList, delCategoryAttributeShowList, addCategoryAttributeShowList, updateCategoryAttributeShowList } from "@/api/parts/categoryAttributeShowList";
import { listCategoryAttribute } from "@/api/parts/categoryAttribute";


const { proxy } = getCurrentInstance();

const categoryAttributeShowListList = ref([]);
const categoryAttributeList = ref([]);
const categoryList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(false);
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
    name: null,
    categoryId: null,
    attrList: null,
    priority: null,
  },
  rules: {
    name: [
      { required: true, message: "一组属性命名不能为空", trigger: "blur" }
    ],
    categoryName: [
      { required: true, message: "部件分类ID不能为空", trigger: "blur" }
    ],
    attrNames: [
      { required: true, message: "属性ID列表不能为空", trigger: "blur" }
    ],
    priority: [
      { required: true, message: "优先级不能为空", trigger: "blur" }
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

/** 查询部件类型显示属性配置列表 */
function getList() {
  loading.value = true;
  listCategoryAttributeShowList(queryParams.value).then(response => {
    categoryAttributeShowListList.value = response.rows;
    total.value = response.total;
    loading.value = false;
	
	categoryAttributeShowListList.value.forEach(row => {
	  if (row.attrNames.length > 0) {
	    row.selectedName = row.attrNames[0];  // 默认选中第一个属性
	  }
	});
  });
}

function handleCategoryChange() {
	
	const queryCategoryAttributeParams = ref({
	  pageNum: 1,
	  pageSize: 1000,
	  categoryId: form.categoryId,
	})
	
	listCategoryAttribute(queryCategoryAttributeParams.value).then(response => {
	  categoryAttributeList.value = response.rows;
	});
	//form.attrIds = '';  // 清空已选择的子类别
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
    categoryId: null,
    attrList: null,
    priority: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("categoryAttributeShowListRef");
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
	title.value = "添加部件类型显示属性配置";
  
	const queryCategoryParams = ref({
	  pageNum: 1,
	  pageSize: 1000
	})
	  
	listCategory(queryCategoryParams.value).then(response => {
	  categoryList.value = response.rows;
	});
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCategoryAttributeShowList(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改部件类型显示属性配置";
  });
}

/** 提交按钮 */
function submitForm() {
	// 必须通过.value访问
  form.value.attrList = JSON.stringify(form.value.attrIds);
  console.log(form.value.attrList)
  proxy.$refs["categoryAttributeShowListRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCategoryAttributeShowList(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCategoryAttributeShowList(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除部件类型显示属性配置编号为"' + _ids + '"的数据项？').then(function() {
    return delCategoryAttributeShowList(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('parts/categoryAttributeShowList/export', {
    ...queryParams.value
  }, `categoryAttributeShowList_${new Date().getTime()}.xlsx`)
}

getList();
</script>
