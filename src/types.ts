// Use const assertions and satisfies operator for better type inference
export const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const
export const FEATURE_STATUSES = [
  'backlog',
  'planning',
  'in-progress',
  'testing',
  'completed',
] as const
export const BUG_STATUSES = [
  'open',
  'in-progress',
  'resolved',
  'closed',
  'wont-fix',
] as const
export const TASK_STATUSES = [
  'todo',
  'in-progress',
  'blocked',
  'completed',
] as const
export const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const

// Use utility types for better maintainability
export type Priority = (typeof PRIORITIES)[number]
export type FeatureStatus = (typeof FEATURE_STATUSES)[number]
export type BugStatus = (typeof BUG_STATUSES)[number]
export type TaskStatus = (typeof TASK_STATUSES)[number]
export type Severity = (typeof SEVERITIES)[number]

// Base interface using modern TypeScript features
export interface BaseItem {
  readonly id: string
  title: string
  description: string
  status: string
  priority: Priority
  assignee?: string | null
  tags: readonly string[]
  createdAt: string // ISO 8601 date string
  updatedAt: string // ISO 8601 date string
}

// Use branded types for better type safety
export type StoryPoints = number & { readonly __brand: 'StoryPoints' }
export type Hours = number & { readonly __brand: 'Hours' }

// Helper functions for branded types
export const createStoryPoints = (value: number): StoryPoints => {
  if (value < 1 || value > 21) {
    throw new Error('Story points must be between 1 and 21')
  }
  return value as StoryPoints
}

export const createHours = (value: number): Hours => {
  if (value < 0) {
    throw new Error('Hours must be non-negative')
  }
  return value as Hours
}

// Feature interface with discriminated union
export interface Feature extends BaseItem {
  readonly type: 'feature'
  status: FeatureStatus
  epic?: string | null
  storyPoints?: StoryPoints
  acceptanceCriteria: readonly string[]
}

// Bug interface with discriminated union
export interface Bug extends BaseItem {
  readonly type: 'bug'
  status: BugStatus
  severity: Severity
  reproducible: boolean
  stepsToReproduce: readonly string[]
  environment: string
  resolution?: string | null
}

// Task interface with discriminated union
export interface Task extends BaseItem {
  readonly type: 'task'
  status: TaskStatus
  dueDate?: string | null // ISO 8601 date string
  estimatedHours?: Hours
  actualHours?: Hours
  subtasks: readonly string[]
}

// Discriminated union for all project items
export type ProjectItem = Feature | Bug | Task

// Use template literal types for better type safety
export type ItemType = ProjectItem['type']

// Project data with metadata
export interface ProjectMetadata {
  projectName: string
  version: string
  lastUpdated: string // ISO 8601 date string
}

export interface ProjectData {
  features: readonly Feature[]
  bugs: readonly Bug[]
  tasks: readonly Task[]
  metadata: ProjectMetadata
}

// Utility types for working with project items
export type ItemsByType<T extends ItemType> = Extract<ProjectItem, { type: T }>
export type ItemsOfType<T extends ItemType> = T extends 'feature'
  ? Feature
  : T extends 'bug'
    ? Bug
    : T extends 'task'
      ? Task
      : never

// Type guards for runtime type checking
export const isFeature = (item: ProjectItem): item is Feature =>
  item.type === 'feature'
export const isBug = (item: ProjectItem): item is Bug => item.type === 'bug'
export const isTask = (item: ProjectItem): item is Task => item.type === 'task'

// Utility type for creating items
export type CreateItemInput<T extends ProjectItem> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt'
> & {
  id?: string
}

// Utility type for updating items
export type UpdateItemInput<T extends ProjectItem> = Partial<
  Omit<T, 'id' | 'type' | 'createdAt'>
> & {
  id: string
}

// Status transition maps using const assertions
export const FEATURE_STATUS_TRANSITIONS: Record<
  FeatureStatus,
  readonly FeatureStatus[]
> = {
  backlog: ['planning'],
  planning: ['in-progress', 'backlog'],
  'in-progress': ['testing', 'planning'],
  testing: ['completed', 'in-progress'],
  completed: [],
} as const

export const BUG_STATUS_TRANSITIONS: Record<BugStatus, readonly BugStatus[]> = {
  open: ['in-progress', 'wont-fix'],
  'in-progress': ['resolved', 'open'],
  resolved: ['closed', 'open'],
  closed: ['open'],
  'wont-fix': ['open'],
} as const

export const TASK_STATUS_TRANSITIONS: Record<
  TaskStatus,
  readonly TaskStatus[]
> = {
  todo: ['in-progress'],
  'in-progress': ['blocked', 'completed', 'todo'],
  blocked: ['in-progress', 'todo'],
  completed: [],
} as const

// Export all status transitions as a union
export type StatusTransitions =
  | typeof FEATURE_STATUS_TRANSITIONS
  | typeof BUG_STATUS_TRANSITIONS
  | typeof TASK_STATUS_TRANSITIONS
