let initialized = false
let outsideClickHandler: ((e: MouseEvent) => void) | null = null
let observer: MutationObserver | null = null

export function initHeroPopup() {
  if (typeof window === 'undefined') return
  if (!document.querySelector('.VPHero')) return

  bindEvents()

  if (initialized) return
  initialized = true

  outsideClickHandler = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('.VPHero .VPButton') && !target.closest('.hero-popup-card')) {
      document.querySelectorAll('.hero-popup-card.is-active').forEach(p => {
        p.classList.remove('is-active')
      })
    }
  }
  document.addEventListener('click', outsideClickHandler)

  observer = new MutationObserver((mutations) => {
    const shouldBind = mutations.some(m => m.addedNodes.length > 0)
    if (shouldBind) {
      requestAnimationFrame(bindEvents)
    }
  })

  const main = document.querySelector('#app') || document.body
  observer.observe(main, { childList: true, subtree: true })
}

export function destroyHeroPopup() {
  outsideClickHandler && document.removeEventListener('click', outsideClickHandler)
  observer?.disconnect()
  outsideClickHandler = null
  observer = null
  initialized = false

  document.querySelectorAll('.VPHero .VPButton.has-popup').forEach(btn => {
    btn.classList.remove('has-popup')
  })
  document.querySelectorAll('.hero-popup-card').forEach(popup => popup.remove())
}

function getPopupContent(buttonText: string, originalHref: string) {
  let title = '专栏详情'
  let desc = '探索更多关于此专栏的内容，深入学习相关的技术与实战经验。'
  let imgSrc = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&h=300'

  let tags = ['Tech', 'Design']
  if (buttonText.includes('探索') || buttonText.includes('开篇')) {
    title = '南辰旧版主页'
    desc = '探索最初的起点，查看往期全栈开发和早期的个人项目积累。'
    imgSrc = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&h=300'
    tags = ['Web3D', 'Vue3']
  } else if (buttonText.includes('成长')) {
    title = '个人成长轨迹'
    desc = '记录点滴成长，分享技术感悟、生活随想与职业发展的心路历程。'
    imgSrc = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&h=300'
    tags = ['Life', 'Career']
  }

  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const tagsHtml = tags.map(t => `<span class="hpc-tag">${t}</span>`).join('')

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
      <a class="hpc-link" href="${originalHref}" target="_blank">立即前往</a>
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
    btn.classList.add('has-popup')

    const originalHref = btn.getAttribute('href') || '#'
    const buttonText = btn.textContent || ''
    ;(btn as HTMLElement).style.cursor = 'pointer'

    const popup = document.createElement('div')
    popup.className = 'hero-popup-card'
    popup.innerHTML = getPopupContent(buttonText, originalHref)
    popup.addEventListener('click', (e) => {
      e.stopPropagation()
    })

    const parent = btn.parentElement
    if (parent) {
      parent.style.position = 'relative'
      parent.appendChild(popup)
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()

      document.querySelectorAll('.hero-popup-card.is-active').forEach(p => {
        if (p !== popup) p.classList.remove('is-active')
      })

      popup.classList.toggle('is-active')
    }, { capture: true })
  })
}
