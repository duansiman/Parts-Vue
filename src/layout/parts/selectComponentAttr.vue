<template>
	<div
	    class="selectAttributeShow"
	    style="border: 1px solid gainsboro; padding: 8px; display: flex; justify-content: space-between; align-items: center;margin-top: 5px;">
		选择属性显示 
				
		<el-select
		   v-model="selectedAttributeShow"
		   @clear="clearAttrShow"
		   placeholder="所有属性"
		   clearable
		   style="width: 100px;"
		   @visible-change="handleVisibleChange"
		>
		   <el-option
			  v-for="attributeShow in categoryAttributeShowListList"
			  :key="attributeShow.name"
			  :label="attributeShow.name"
			  :value="attributeShow.id"
			  @click="handleSelectAttributeListChange(attributeShow)"
		   />
		</el-select>
		
		<!-- 	添加或修改部件公司信息对话框 -->
		<el-dialog  class="selectAttributeShowDialog" :title="selectData.title" v-model="selectData.open" width="800px" append-to-body>
		  <TextDragList v-model="selectAttrs"/>
		  <el-row :gutter="10" class="mb8">
			  <el-checkbox-group v-model="selectShowAttrList">
				<el-checkbox v-for="categoryAttribute in categoryAttributeList" 
					:label="categoryAttribute.attr.attrName" 
					:value="categoryAttribute.attr.attrId"/>
			  </el-checkbox-group>
		  </el-row>
		  <template #footer>
		    <div class="dialog-footer">
		      <el-button type="primary" @click="submitSelectAttributeShow">确 定</el-button>
		      <el-button @click="cancel">取 消</el-button>
		    </div>
		  </template>
		</el-dialog>
	</div>
</template>

<script setup>
	import { inject, watch, computed } from 'vue';
	import { listCategoryAttributeShowList } from "@/api/parts/categoryAttributeShowList";
	import { listUserCategoryAttribute } from "@/api/parts/categoryAttribute";
	import TextDragList from './TextDragList.vue';
	
	const { proxy } = getCurrentInstance();
	const { checkLogin } = proxy.loginService();
	
	function handleVisibleChange(visible) {
		if(visible) {
			return checkLogin();
		}
		return visible;
	}
	
	// 显示属性组
	const selectedAttributeShow = ref(0);
	const categoryAttributeShowListList = ref([]);
	function getAttributeShow() {
		const queryParams = {
		  pageNum: 1,
		  pageSize: 1000,
		  categoryId: categroyId.value,
		}
		listCategoryAttributeShowList(queryParams).then(response => {
			categoryAttributeShowListList.value = response.rows;
			selectedAttributeShow.value = categoryAttributeShowListList.value[0].id;		
			const customShow = {
				id: -1,
				name: '自定义属性显示',
			}
			categoryAttributeShowListList.value.push(customShow)
		});
	}
	
	// 通知其他组件
	const updateSelectedAttributeShow = inject('updateSelectedAttributeShow');
	watch(selectedAttributeShow, (newValue) => {
		if (newValue) {
			console.log('selectComponentAttr send selectedAttributeShow=', newValue);
			updateSelectedAttributeShow(newValue)
		}
	});
	
	// 监听其他组件通知
	const categroyId = inject('categroyId');
	watch(categroyId, (newValue) => {
		if (newValue && categoryAttributeShowListList.value.length > 0) {
			console.log('selectComponentAttr received categoryId=', newValue);
			console.log('categoryAttributeShowListList=', categoryAttributeShowListList);
			selectedAttributeShow.value = categoryAttributeShowListList.value[0].id;
		}
		getAttributeShow();
	});
	
	function clearAttrShow() {
		console.log("clearAttrShow")
		selectedAttributeShow.value = categoryAttributeShowListList.value[0].id;
		selectShowAttrList.value.clear();
	}
	
	// 自定义属性
	const selectData = reactive({
	  // 是否显示弹出层（用户导入）
	  open: false,
	  // 弹出层标题（用户导入）
	  title: ""
	});
	const selectShowAttrList = ref([]);
	const categoryAttributeList = ref([]);
	function getCategoryAttrList() {
		const queryParams = {
			pageNum: 1,
			pageSize: 1000,
			categoryId: categroyId.value,
			funcTemplateAttr: 0
		}
	    listUserCategoryAttribute(queryParams).then(response => {
			categoryAttributeList.value = response.rows;
	    });
	}
	const handleSelectAttributeListChange = (item) => {
		selectedAttributeShow.value = item.id;
		if(item.name === '自定义属性显示') {
			selectData.open = true;
			selectData.title = '选择自定义属性'
			getCategoryAttrList()
		}
	};
	const updateSelectShowAttrList = inject('updateSelectShowAttrList');
	const selectAttrs = ref([]);
	watch(selectShowAttrList, (newValue, oldValue) => {
		if(newValue.length == 0) {
			console.log("selectedAttributeShow.value", selectedAttributeShow.value)
			selectedAttributeShow.value = categoryAttributeShowListList.value[0].id;
			console.log("selectedAttributeShow.value", selectedAttributeShow.value)
		}
		
		const addedIds = newValue.filter(id =>!oldValue.includes(id));
		const removedIds = oldValue.filter(id =>!newValue.includes(id));
		// selectAttrs.value = categoryAttributeList.value.filter(item => selectShowAttrList.value.includes(item.attr.attrId));
		if (addedIds.length != 0 && !selectAttrs.value.includes(addedIds[0])) {
			// 只有当元素不在selectAttrs中时才添加，避免重复添加
			const optAttr = categoryAttributeList.value.find(item => addedIds[0] === item.attr.attrId);
			selectAttrs.value.push(optAttr);
		} 
		
		if (removedIds.length != 0){
			// 使用splice方法移除元素，找到元素在数组中的索引并移除它
			const optAttr = categoryAttributeList.value.find(item => removedIds[0] === item.attr.attrId);
			const index = selectAttrs.value.indexOf(optAttr);
			if (index > -1) {
				selectAttrs.value.splice(index, 1);
			}
		}
	});
	
	function submitSelectAttributeShow() {
		const newValue = selectAttrs.value.map(item => item.attr.attrId);
		console.log("submitSelectAttributeShow", newValue)
		updateSelectShowAttrList(newValue)
		selectData.open = false;
	}
	
	function cancel() {
	  selectData.open = false;
	}
	
</script>

<style>
</style>