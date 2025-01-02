<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
		<el-form-item>
				<el-select
				   v-model="queryParams.categoryId"
				   placeholder="选择分类"
				   clearable
				   style="width: 220px;"
				>
				   <el-option
					  v-for="category in categoryList"
					  :key="category.id"
					  :label="category.name"
					  :value="category.id"
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
	  <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="分类名称" align="center" prop="category.name" />
	  <el-table-column label="一组属性命名" align="center" prop="name" />
      <el-table-column label="属性列表" align="center">
		  <template #default="scope">
			  <el-text v-for="attr in scope.row.attrs">
			  	{{attr.attrName}}、
			  </el-text>
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
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="categoryAttributeShowListRef" :model="form" :rules="rules" label-width="120px">
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
				  :key="category.name"
				  :label="category.name"
				  :value="category.id"
				 />
			  </el-select>
		  </el-form-item>
        <el-form-item label="一组属性命名" prop="name">
          <el-input v-model="form.name" placeholder="请输入一组属性命名" />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input v-model="form.priority" placeholder="请输入优先级" />
        </el-form-item>
		<el-form-item label="选中分类属性" prop="attrIds">
			<TextDragList v-model="selectAttrs" style="width: 100%;"/>
			<el-row :gutter="10" class="mb8">
				  <el-checkbox-group v-model="selectShowAttrList">
					<el-checkbox v-for="categoryAttribute in categoryAttributeList" 
						:label="categoryAttribute.attrName" 
						:value="categoryAttribute.attrId"/>
				  </el-checkbox-group>
			</el-row>
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
	import TextDragList from "@/views/parts/TextDragList.vue"
	import { listCategory } from "@/api/parts/category";
	import { listAttributeV2} from "@/api/parts/attribute";
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

	const selectShowAttrList = ref([]);
	const selectAttrs = ref([]);

	watch(selectShowAttrList, (newValue, oldValue) => {
		const addedIds = newValue.filter(id =>!oldValue.includes(id));
		const removedIds = oldValue.filter(id =>!newValue.includes(id));
		console.log("addedIds",addedIds,"removedIds",removedIds);
		// selectAttrs.value = categoryAttributeList.value.filter(item => selectShowAttrList.value.includes(item.attr.attrId));
		if (addedIds.length != 0 && !selectAttrs.value.includes(addedIds[0])) {
			// 只有当元素不在selectAttrs中时才添加，避免重复添加
			const optAttr = categoryAttributeList.value.find(item => addedIds[0] === item.attrId);
			selectAttrs.value.push(optAttr);
		} 
		
		if (removedIds.length != 0){
			// 使用splice方法移除元素，找到元素在数组中的索引并移除它
			const optAttr = categoryAttributeList.value.find(item => removedIds[0] === item.attrId);
			const index = selectAttrs.value.indexOf(optAttr);
			console.log("remove optAttr", optAttr, "index", index);
			if (index > -1) {
				selectAttrs.value.splice(index, 1);
			}
		}
	});

	const data = reactive({
	  form: {
		  categoryId: null,
	  },
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
		  if (row.attrs.length > 0) {
			row.selectedName = row.attrs[0];  // 默认选中第一个属性
		  }
		});
	  });
	}

	function handleCategoryChange() {
		console.log("form.categoryId",form.value.categoryId)
		queryCategoryAttribute(form.value.categoryId)
	}

	function queryCategoryAttribute(categoryId) {
		const queryCategoryAttributeParams = {
		  pageNum: 1,
		  pageSize: 1000,
		  categoryId: categoryId
		}
		
		listCategoryAttribute(queryCategoryAttributeParams).then(response => {
		  categoryAttributeList.value = response.rows.map(item => item.attr);
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
	async function handleAdd() {
		reset();
		selectAttrs.value = [];
		selectShowAttrList.value = [];
		
		const response = await listAttributeV2({pageNum: 1,pageSize: 1000, funcTemplateAttr:0, visible:1})
		categoryAttributeList.value = response.rows;
		
		open.value = true;
		title.value = "添加部件类型显示属性配置";
	}

	/** 修改按钮操作 */
	async function handleUpdate(row) {
	  reset();
	  
	  form.value.id = row.id;
	  form.value.priority = row.priority;
	  form.value.name = row.name;
	  form.value.categoryId = row.category.id
	  
	  selectShowAttrList.value = row.attrs.map(item => item.attrId);
	  console.log("handleUpdate form.value", form.value, "selectShowAttrList", selectShowAttrList);
	  
	  const queryCategoryAttributeParams = {
	    pageNum: 1,
	    pageSize: 1000,
	    categoryId: form.value.categoryId
	  }
	  
	  const response = await listCategoryAttribute(queryCategoryAttributeParams);
	  categoryAttributeList.value = response.rows.map(item => item.attr);
	  selectAttrs.value = categoryAttributeList.value.filter(item => {
	  	return row.attrs.some(showItem => showItem.attrId === item.attrId);
	  });
	  console.log("handleUpdate selectAttrs", selectAttrs);
	  
	 //  listCategoryAttribute(queryCategoryAttributeParams).then(response => {
	 //    categoryAttributeList.value = response.rows;
		// selectAttrs.value = categoryAttributeList.value.filter(item => {
		// 	return row.attrs.some(showItem => showItem.attrId === item.attr.attrId);
		// });
		// console.log("handleUpdate selectAttrs", selectAttrs);
	 //  });
	  
	  open.value = true;
	  title.value = "修改部件类型显示属性配置";
	}

	/** 提交按钮 */
	function submitForm() {
		console.log("submitForm",form)
		// 必须通过.value访问
	  form.value.attrList = JSON.stringify(selectAttrs.value.map(item => item.attrId));
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
	listCategory({pageNum: 1, pageSize: 1000}).then(response => {
	  categoryList.value = response.rows;
	});
</script>
