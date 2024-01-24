<!--
 * @Description: 
 * @Autor: Southern Wind
 * @Date: 2024-01-10 11:37:47
 * @LastEditors: Southern Wind
 * @LastEditTime: 2024-01-18 14:47:38
-->
<template>
  <div class="home-wrapper">
    <div v-for="item in list" :key="item" class="home-item">{{ item }}</div>
    
  </div>
</template>
  
<script lang="ts" setup>
import {ref} from 'vue';

const list = [1, 2, 3, 4, 5, 6, 7, 8, 9];

</script>
  
  <style scoped>
.home-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
.home-item {
  vertical-align: middle;
  margin: 4px 4px 10px;
  padding: 4px 8px;
  font-weight: bolder;
  display: inline-block;
  cursor: pointer;
  border-radius: 2px;
  line-height: 13px;
  font-size: 13px;
  box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.5s;
}
@media (max-width: 768px){
  .home-item {

  }
}
</style>
  