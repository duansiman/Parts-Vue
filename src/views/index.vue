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
			  <el-text>公司总数：{{statObj.companySize}}</el-text>
			  <el-scrollbar height="60vh">
				  <el-table :data="statObj.companyDataSize" style="margin-top: 10px;">
					<el-table-column label="公司名称" align="center" prop="name" />
					<el-table-column label="部件数量" align="center" prop="count" />
				  </el-table>
			  </el-scrollbar>
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
			  <el-text>分类总数：{{statObj.categorySize}}</el-text>
			  <el-scrollbar height="60vh">
				  <el-table :data="statObj.categoryDataSize" style="margin-top: 10px;">
					<el-table-column label="分类名称" align="center" prop="name" />
					<el-table-column label="部件数量" align="center" prop="count" />
				  </el-table>
			  </el-scrollbar>
	      </div>
	    </el-card>
	  </el-col>
	  <el-col :xs="24" :sm="24" :md="12" :lg="8">
	    <el-card class="update-log">
	      <template v-slot:header>
	        <div class="clearfix">
	          <span>部件属性</span>
	        </div>
	      </template>
	      <div class="body">
			  <el-text>属性总数：{{statObj.attrSize}}</el-text>
			  <el-scrollbar height="60vh">
				  <el-table :data="statObj.categoryAttrSize" style="margin-top: 10px;">
					<el-table-column label="分类名称" align="center" prop="name" />
					<el-table-column label="属性数量" align="center" prop="count" />
				  </el-table>
			  </el-scrollbar>
	      </div>
	    </el-card>
	  </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
	import { stat } from "@/api/parts/componentStatistics";
	
	const statObj = ref({});
	
	stat().then(response => {
	  statObj.value = response.data;
	  console.log("statObj=", statObj.value)
	});
	
</script>