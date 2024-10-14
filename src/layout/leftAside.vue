<template>
  <div class="parent-container">
    <el-row type="flex" class="full-height">
      <el-col class="child-box" style="background-color: aqua;">
        <el-card style="height: 100%; width: 100%;">
          <SystemCompany/>
        </el-card>
      </el-col>
      <el-col class="child-box">
        <el-card style="height: 100%; width: 100%;">
          <SelectComponentCompany/>
        </el-card>
      </el-col>
      <el-col class="child-box">
        <el-card style="height: 100%; width: 100%;">
          <h3>组件三</h3>
          <p>这是第三个组件的内容。</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
	import SystemCompany from './parts/systemCompany.vue'
	import SelectComponentCompany from './parts/selectComponentCompany.vue'
</script>

<style scoped>
/* 父容器，使用 flex 布局并占满可用空间 */
.parent-container {
  display: flex;
  height: 100%; /* 占满整个视口高度 */
}

/* 让 el-row 占满父组件的高度 */
.full-height {
  flex: 1;
  flex-direction: column; /* 垂直布局 */
}

/* 子元素平分父容器的高度 */
.child-box {
  flex: 1;
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  margin: 0px;
}
</style>
