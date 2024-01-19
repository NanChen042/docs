---
layoutClass: m-nav-layout
outline: [2, 3, 4]
---

<script setup>
import MNavLinks from './components/MNavLinks.vue'
import  {NAV_DATA}  from './data'
</script>
<style src="./index.scss"></style>


# 前端导航

想用什么就来逛逛吧~
<MNavLinks    v-for="{title, items} in NAV_DATA" :title="title"  :items="items"/>


<style>
   /*  .m-home-layout .image-src:hover {
  transform: translate(-50%, -50%) rotate(666turn);
  transition: transform 59s 1s cubic-bezier(0.3, 0, 0.8, 1);
} */

.m-home-layout .details small {
  opacity: 0.8;
}

.m-home-layout .bottom-small {
  display: block;
  margin-top: 2em;
  text-align: right;
}
</style>