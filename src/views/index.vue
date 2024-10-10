<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <template v-slot:header>
            <div class="clearfix">
              <span>部件公司</span>
            </div>
          </template>
          <div class="body">
          </div>
        </el-card>
      </el-col>
	  <el-col :xs="24" :sm="24" :md="12" :lg="8">
	    <el-card class="update-log">
	      <template v-slot:header>
	        <div class="clearfix">
	          <span>部件分类</span>
	        </div>
	      </template>
	      <div class="body">
	      </div>
	    </el-card>
	  </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
const version = ref('3.8.8')

function goTarget(url) {
  window.open(url, '__blank')
}
</script>