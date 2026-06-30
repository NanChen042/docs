let initialized = false
let outsideClickHandler: ((e: MouseEvent) => void) | null = null
let heroClickHandler: ((e: MouseEvent) => void) | null = null
let observer: MutationObserver | null = null

export function initHeroPopup() {
  if (typeof window === 'undefined') return
  if (!document.querySelector('.VPHero')) return

  bindEvents()

  if (initialized) return
  initialized = true

  // 在 capture 阶段拦截，优先于 Vue Router 对站内链接的处理
  heroClickHandler = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('.hero-popup-card')) return

    const btn = target.closest('.VPHero .VPButton.has-popup') as HTMLElement | null
    if (!btn) return

    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()

    const popup = btn.parentElement?.querySelector('.hero-popup-card')
    if (!popup) return

    document.querySelectorAll('.hero-popup-card.is-active').forEach(p => {
      if (p !== popup) p.classList.remove('is-active')
    })
    popup.classList.toggle('is-active')
  }
  document.addEventListener('click', heroClickHandler, { capture: true })

  outsideClickHandler = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('.VPHero .VPButton') && !target.closest('.hero-popup-card')) {
      document.querySelectorAll('.hero-popup-card.is-active').forEach(p => {
        p.classList.remove('is-active')
      })
    }
  }
  document.addEventListener('click', outsideClickHandler)

  observer = new MutationObserver(() => {
    requestAnimationFrame(bindEvents)
  })

  const main = document.querySelector('#app') || document.body
  observer.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] })
}

export function destroyHeroPopup() {
  heroClickHandler && document.removeEventListener('click', heroClickHandler, { capture: true })
  outsideClickHandler && document.removeEventListener('click', outsideClickHandler)
  observer?.disconnect()
  heroClickHandler = null
  outsideClickHandler = null
  observer = null
  initialized = false

  document.querySelectorAll('.VPHero .VPButton.has-popup').forEach(btn => {
    const el = btn as HTMLElement
    el.removeAttribute('role')
    el.classList.remove('has-popup')
  })
  document.querySelectorAll('.hero-popup-card').forEach(popup => popup.remove())
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href)
}

function getPopupContent(buttonText: string) {
  let title = '专栏详情'
  let desc = '探索更多关于此专栏的内容，深入学习相关的技术与实战经验。'
  let imgSrc = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&h=300'
  let originalHref = '#'
  let tags = ['Tech', 'Design']

  if (buttonText.includes('探索') || buttonText.includes('开篇')) {
    title = '南辰旧版主页'
    desc = '探索最初的起点，查看往期全栈开发和早期的个人项目积累。'
    imgSrc = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&h=300'
    tags = ['Web3D', 'Vue3']
    originalHref = 'https://vue3-blog-bt9.pages.dev/#/home'
  } else if (buttonText.includes('成长')) {
    title = '个人成长轨迹'
    desc = '记录点滴成长，分享技术感悟、生活随想与职业发展的心路历程。'
    imgSrc = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&h=300'
    tags = ['Life', 'Career']
    originalHref = '/column/home/index'
  }

  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const tagsHtml = tags.map(t => `<span class="hpc-tag">${t}</span>`).join('')
  const linkTarget = isExternalHref(originalHref) ? ' target="_blank" rel="noopener noreferrer"' : ''

  return `
    <div class="hpc-image-wrapper">
      <img class="hpc-image" src="${imgSrc}" alt="cover" />
    </div>
    <div class="hpc-meta">
      <img src="/logos.png" class="hpc-avatar" alt="avatar" />
      <span class="hpc-date">${dateStr}</span>
    </div>
    <h3 class="hpc-title">${title}</h3>
    <p class="hpc-desc">${desc}</p>
    <div class="hpc-action">
      <a class="hpc-link" href="${originalHref}"${linkTarget}>立即前往</a>
    </div>
    <div class="hpc-footer">
      <span class="hpc-footer-label">Categories</span>
      <div class="hpc-tags">
        ${tagsHtml}
      </div>
    </div>
  `
}

function bindEvents() {
  const buttons = document.querySelectorAll('.VPHero .VPButton:not(.has-popup)')
  buttons.forEach((btn) => {
    const el = btn as HTMLElement
    el.classList.add('has-popup')

    el.setAttribute('role', 'button')
    el.style.cursor = 'pointer'

    const buttonText = el.textContent || ''

    const popup = document.createElement('div')
    popup.className = 'hero-popup-card'
    popup.innerHTML = getPopupContent(buttonText)
    popup.addEventListener('click', (e) => {
      e.stopPropagation()
    })

    const parent = el.parentElement
    if (parent) {
      parent.style.position = 'relative'
      parent.appendChild(popup)
    }
  })
}
