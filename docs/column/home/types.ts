export type ActivityType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

export interface GrowthActivity {
  timestamp: string
  title: string
  content: string
  type: ActivityType
}
