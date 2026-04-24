import { computed } from 'vue'

export function useExperience(startDateInput: string) {
  const startDate = new Date(startDateInput)

  const experience = computed(() => {
    const now = new Date()
    const diffTime = now.getTime() - startDate.getTime()
    const years = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365))
    const months = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30))

    if (years === 0) {
      return `${months}个月`
    }

    if (months === 0) {
      return `${years}年`
    }

    return `${years}年${months}个月`
  })

  return {
    experience
  }
}
