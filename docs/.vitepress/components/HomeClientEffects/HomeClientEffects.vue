<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import GravityTags from '../GravityTags.vue'
import { initHeroPopup, destroyHeroPopup } from '../../theme/hero-popup'

const isMounted = ref(false)
let accordionInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // 必须等 Vue 水合完成后再绑定 Hero 弹窗，否则会破坏 SSR DOM 导致 mismatch
  nextTick(() => {
    requestAnimationFrame(() => {
      initHeroPopup()
    })
  })

  setTimeout(() => {
    if (document.getElementById('gravity-tags-mount')) {
      isMounted.value = true
    }
  }, 100)

  const initAccordion = () => {
    const card = document.querySelector('.VPFeatures .item:nth-child(5)')
    const list = document.querySelector('.dynamic-article-list')
    if (!list || !card) return

    const items = Array.from(list.children)
    items.sort(() => Math.random() - 0.5)
    list.innerHTML = ''

    const activeItems: Element[] = []
    items.forEach((item, index) => {
      ;(item as HTMLElement).style.display = index < 5 ? 'block' : 'none'
      item.classList.remove('is-active')
      list.appendChild(item)
      if (index < 5) activeItems.push(item)
    })

    if (activeItems.length === 0) return

    activeItems[0].classList.add('is-active')

    activeItems.forEach(item => {
      const summary = item.querySelector('.article-summary')
      if (summary) {
        summary.onclick = () => {
          if (item.classList.contains('is-active')) return
          activeItems.forEach(el => el.classList.remove('is-active'))
          item.classList.add('is-active')
        }
      }
    })

    let currentIndex = 0
    const nextAccordion = () => {
      currentIndex = (currentIndex + 1) % activeItems.length
      activeItems.forEach(el => el.classList.remove('is-active'))
      activeItems[currentIndex].classList.add('is-active')
    }

    if (accordionInterval) clearInterval(accordionInterval)
    accordionInterval = setInterval(nextAccordion, 4000)

    card.onmouseenter = () => {
      if (accordionInterval) clearInterval(accordionInterval)
    }
    card.onmouseleave = () => {
      const curActive = activeItems.findIndex(el => el.classList.contains('is-active'))
      if (curActive !== -1) currentIndex = curActive
      accordionInterval = setInterval(nextAccordion, 4000)
    }
  }

  setTimeout(initAccordion, 100)
})

onUnmounted(() => {
  if (accordionInterval) clearInterval(accordionInterval)
  destroyHeroPopup()
})
</script>

<template>
  <Teleport to="#gravity-tags-mount" v-if="isMounted">
    <GravityTags />
  </Teleport>
</template>
