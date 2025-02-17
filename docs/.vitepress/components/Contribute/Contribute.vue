<template>
  <div>
    <img class="github-chart" :src="url" alt="Southern Wind's Blue Github Chart" />

    <div class="flex">
      <h1>访问量:</h1>
      <img src="https://hitwebcounter.com/counter/counter.php?page=19094990&style=0024&nbdigits=5&type=page&initCount=0" title="Counter Widget" Alt="Visit counter For Websites" border="0" />
    </div>
  </div>
</template>

<script lang="ts" setup>
const url =
  'https://ghchart.rshah.org/409ba5/NanChen042'

</script>

<style lang="scss" scoped>
.flex {
  display: flex;
  justify-content: center;
}

div {
  max-width: 1198px;
  margin: 0 auto;
  padding: 50px 0 0;
  box-sizing: border-box;

  .github-chart {
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

    .github-chart {
      width: 100%;
      height: 5rem;
      width: auto;

      object-fit: contain;
    }
  }
}
</style>
