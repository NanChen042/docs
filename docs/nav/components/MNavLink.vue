
<script setup lang="ts">
import { computed,  } from "vue";
import { NavLink } from "./type";
import { slugify } from "@mdit-vue/shared";

const props = defineProps<{
  icon?: NavLink["icon"];
  title?: NavLink["title"];
  desc?: NavLink["desc"];
  link: NavLink["link"];
}>();

const formatTitle = computed(() => {
  if (!props.title) {
    return "";
  }
  if (!props.desc) {
    return "";
  }
  console.log(props.title);

  return slugify(props.title);
});

const svg = computed(() => {
  if (typeof props.icon === "object") return props.icon.svg;
  return "";
});
</script>

<template>
  <!-- trigger="click" -->
  <client-only>
    <el-tooltip effect="customized" placement="top">
      <template #content>
        <div style="max-width: 300px; white-space: normal; line-height: 1.4; color: #fff;">
          {{ desc ? desc : '待更新' }}
        </div>
      </template>
      <a class="m-nav-link" :href="link" target="_blank">
        <article class="box">
          <div class="box-header">
            <div v-if="svg" class="icon" v-html="svg"></div>
            <div v-else-if="icon && typeof icon === 'string'" class="icon">
              <img :src="icon" :alt="title" onerror="this.parentElement.style.display='none'" />
            </div>
            <div v-else class="icon">
              <img src="/bitbug_favicon.ico" alt="">
            </div>
            <!-- <h6 v-if="title" class="title">{{ title }}</h6> -->
            <h5 v-if="title" :id="formatTitle" class="title">{{ title }}</h5>
          </div>
          <p v-if="desc" class="desc">{{ desc }} </p>
        </article>
      </a>
    </el-tooltip>
  </client-only>
</template>
<style>
.el-popper span {
  color: var(--vp-tooltip-color-before);
}
.el-popper.is-customized {
  /* Set padding to ensure the height is 32px */
  padding: 6px 12px;
  background: var(--vp-tooltip-bg);
}

.el-popper.is-customized .el-popper__arrow::before {
  background: var(--vp-tooltip-bg-before);
  right: 0;
}
</style>
<style lang="scss" scoped>
.vp-doc a {
  text-decoration: auto;
}
.m-nav-link {
  display: block;
  border: 1px solid var(--vp-c-bg-soft);
  background-color: var(--vp-c-bg-alt);
  border-radius: 8px;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    background-color: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-brand-1);
    box-shadow: var(--vp-shadow-2);
  }

  .box {
    display: flex;
    flex-direction: column;
    padding: 16px;
    height: 100%;
    color: var(--vp-c-text-1);
    &-header {
      display: flex;
      align-items: center;
    }
  }

  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 12px;
    border-radius: 6px;
    width: 48px;
    height: 48px;
    font-size: 24px;
    background-color: var(--vp-c-default-soft);
    transition: background-color 0.25s;
    :deep(svg) {
      width: 24px;
      fill: currentColor;
      color: white; /* 设置 SVG 为白色 */
    }
    :deep(img) {
      border-radius: 4px;
      width: 24px;
    }
  }

  .title {
    width: 200px;
    overflow: hidden;
    flex-grow: 1;
    white-space: nowrap;
    text-overflow: ellipsis;
    line-height: 48px;
    font-size: 16px;
    font-weight: 600;
  }
  .el-link__inner {
    display: block;
  }

  .desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-grow: 1;
    margin: 10px 0 0;
    line-height: 20px;
    font-size: 12px;
    color: var(--vp-c-text-2);
  }
}

@media (max-width: 960px) {
  .m-nav-link {
    .box {
      padding: 8px;
    }
    .icon {
      width: 40px;
      height: 40px;
    }
    .title {
      line-height: 40px;
      font-size: 14px;
    }
  }
}
</style>

