<template>
	<div         
		style="border: 1px solid gainsboro; padding: 8px; display: flex; justify-content: space-between; align-items: center;">
		上传过滤文件筛选<el-button @click="showUploadDialog">上传</el-button>
		
		<!-- 用户导入对话框 -->
		<el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
		   <el-upload
		      ref="uploadRef"
		      :limit="1"
		      accept=".xlsx, .xls, .zip"
		      :headers="upload.headers"
		      :disabled="upload.isUploading"
		      :on-progress="handleFileUploadProgress"
		      :on-success="handleFileSuccess"
			  :before-upload="handleBeforeUpload"
			  :on-change="handleFileChange"
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
		            <span>仅允许导入xls、xlsx格式文件。</span>
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

<script setup>
	import { getToken } from "@/utils/auth";
	import { computed, inject, watch, nextTick } from 'vue';
	
	const { proxy } = getCurrentInstance();
	const { checkLogin } = proxy.loginService();
	
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
	
	function showUploadDialog() {
		if(checkLogin()) {
			upload.open = true;
			upload.title = "上传过滤文件"
		}
	}
	
	function importTemplate() {
	  proxy.download("/parts/componentData/filter/template", {
	  }, `filter_template_${new Date().getTime()}.xlsx`);
	};
	const uploadRef = ref(null);
	const componentDataFilterFile = ref(null);
	
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
	};
	const handleBeforeUpload = (file) => {
	  componentDataFilterFile.value = file;  // 将文件存储在变量中
	  console.log("Selected file:", file);
	  return false; // 阻止自动上传
	}
	
	const handleFileChange = (files) => {
		componentDataFilterFile.value = files;
	    console.log('上传的文件对象:', files);
	}
	// 通知其他组件
	const updateComponentDataFilterFile = inject('updateComponentDataFilterFile');
	/** 提交按钮 */
	function submitFileForm() {
		if (componentDataFilterFile.value) {
			// 修改文件的 uid
			componentDataFilterFile.value.uid = Date.now() + Math.random().toString(36).substr(2);
		}
		console.log("submitFileForm", componentDataFilterFile.value);
		updateComponentDataFilterFile(componentDataFilterFile.value);
		upload.open = false;
	};
</script>

<style>
</style>