<template>
  <el-row class="text-container" justify-content="flex-start">
    <el-col
		  v-for="(item, index) in modelValue"
		  :key="index"
		  :span="3"
		  class="text-item"
		  draggable="true"
		  @dragstart="handleDragStart(index)"
		  @dragover.prevent
		  @drop="handleDrop(index)"
		>
		<template #default>
			<div style="width: 100%; height: 100%; padding: 0px; margin: 0px;">
				<el-row>
					<el-col :span="18" style="display: flex; align-items: center;">
						<el-tooltip effect="dark" :content="item.attrName" placement="top">
						  <span style="text-overflow: clip; white-space: nowrap; overflow: hidden; width: 100%;max-width: 100%;">{{ item.attrName }}</span>
						</el-tooltip>
					</el-col>
					<el-col :span="6" style="display: flex; justify-content: flex-end; align-items: center;">
						<el-icon><Operation /></el-icon>
					</el-col>
				</el-row>
			</div>
			<!-- <el-text>{{ item.attr.attrName }}</el-text><el-icon><Operation /></el-icon> -->
		</template>
    </el-col>
  </el-row>
</template>

<script setup>
	import { defineProps, defineEmits } from 'vue';
	
	const props = defineProps({
		modelValue: Array
	})
	console.log("props.modelValue", props.modelValue)
	
	let draggedIndex;
	
	const handleDragStart = (index) => {
	  draggedIndex = index;
	  // 设置相关的拖拽数据传输属性
	  event.dataTransfer.effectAllowed = 'move';
	  event.dataTransfer.setData('text/plain', '');
	};
	
	const emit = defineEmits(['update:modelValue']);
	const handleDrop = (targetIndex) => {
	  const list = props.modelValue;
	  const [draggedItem] = list.splice(draggedIndex, 1);
	  list.splice(targetIndex, 0, draggedItem);
	  emit('update:modelValue', list); // 触发自定义事件通知父组件更新数据
	};
	

</script>

<style scoped>
	.text-container {
	  margin: 10px 0px;
	}
	.text-item {
	  cursor: pointer;
	  border-radius: 1px;
	  padding: 5px;
	  margin-right: 5px;
	  margin-bottom: 5px;
	  border: 1px solid lightgrey;
	  text-align: center;
	}
</style>