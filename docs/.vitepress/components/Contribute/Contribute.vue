<!-- author: Mr.J -->
<!-- date: 2024-01-18 14:53:12 -->
<!-- description: Vue3+TS代码块模板 -->
<template>
  <div>
    <img :src="url" alt="Southern Wind's Blue Github Chart" />
  </div>
</template>

<script lang="ts" setup>
const url =
  'https://ghchart.rshah.org/409ba5/NanChen042'

</script>

<style lang="scss" scoped>
div {
  max-width: 1198px;
  margin: 0 auto;
  padding: 50px 0;
  box-sizing: border-box;
  img {
    width: 100%;
  }
}
@media screen and (max-width: 768px) {
  div {
    width: 100%;
    margin: 0 auto;
    padding: 20px;
    overflow: scroll;
    box-sizing: border-box;
    img {
      width: 100%;
      height: 5rem;
      width: auto;

      object-fit: contain;
    }
  }
}
</style>