import { describe, it, expect } from 'vitest'
import {
  PRIORITIES,
  FEATURE_STATUSES,
  BUG_STATUSES,
  TASK_STATUSES,
  SEVERITIES,
  createStoryPoints,
  createHours,
  isFeature,
  isBug,
  isTask,
  FEATURE_STATUS_TRANSITIONS,
  BUG_STATUS_TRANSITIONS,
  TASK_STATUS_TRANSITIONS,
  type Feature,
  type Bug,
  type Task,
  type ProjectItem,
} from './types.js'

describe('Constants', () => {
  it('should have correct priorities', () => {
    expect(PRIORITIES).toEqual(['low', 'medium', 'high', 'critical'])
  })

  it('should have correct feature statuses', () => {
    expect(FEATURE_STATUSES).toEqual([
      'backlog',
      'planning',
      'in-progress',
      'testing',
      'completed',
    ])
  })

  it('should have correct bug statuses', () => {
    expect(BUG_STATUSES).toEqual([
      'open',
      'in-progress',
      'resolved',
      'closed',
      'wont-fix',
    ])
  })

  it('should have correct task statuses', () => {
    expect(TASK_STATUSES).toEqual([
      'todo',
      'in-progress',
      'blocked',
      'completed',
    ])
  })

  it('should have correct severities', () => {
    expect(SEVERITIES).toEqual(['low', 'medium', 'high', 'critical'])
  })
})

describe('Branded Types', () => {
  describe('createStoryPoints', () => {
    it('should create story points for valid values', () => {
      expect(createStoryPoints(1)).toBe(1)
      expect(createStoryPoints(13)).toBe(13)
      expect(createStoryPoints(21)).toBe(21)
    })

    it('should throw error for invalid values', () => {
      expect(() => createStoryPoints(0)).toThrow(
        'Story points must be between 1 and 21',
      )
      expect(() => createStoryPoints(22)).toThrow(
        'Story points must be between 1 and 21',
      )
      expect(() => createStoryPoints(-1)).toThrow(
        'Story points must be between 1 and 21',
      )
    })
  })

  describe('createHours', () => {
    it('should create hours for valid values', () => {
      expect(createHours(0)).toBe(0)
      expect(createHours(8.5)).toBe(8.5)
      expect(createHours(100)).toBe(100)
    })

    it('should throw error for negative values', () => {
      expect(() => createHours(-1)).toThrow('Hours must be non-negative')
      expect(() => createHours(-0.5)).toThrow('Hours must be non-negative')
    })
  })
})

describe('Type Guards', () => {
  const mockFeature: Feature = {
    id: 'f1',
    title: 'Test Feature',
    description: 'Test description',
    type: 'feature',
    status: 'backlog',
    priority: 'medium',
    tags: [],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    acceptanceCriteria: ['Must work'],
  }

  const mockBug: Bug = {
    id: 'b1',
    title: 'Test Bug',
    description: 'Test description',
    type: 'bug',
    status: 'open',
    priority: 'high',
    severity: 'critical',
    reproducible: true,
    stepsToReproduce: ['Step 1'],
    environment: 'Production',
    tags: [],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  }

  const mockTask: Task = {
    id: 't1',
    title: 'Test Task',
    description: 'Test description',
    type: 'task',
    status: 'todo',
    priority: 'low',
    subtasks: [],
    tags: [],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  }

  describe('isFeature', () => {
    it('should return true for features', () => {
      expect(isFeature(mockFeature)).toBe(true)
    })

    it('should return false for non-features', () => {
      expect(isFeature(mockBug)).toBe(false)
      expect(isFeature(mockTask)).toBe(false)
    })
  })

  describe('isBug', () => {
    it('should return true for bugs', () => {
      expect(isBug(mockBug)).toBe(true)
    })

    it('should return false for non-bugs', () => {
      expect(isBug(mockFeature)).toBe(false)
      expect(isBug(mockTask)).toBe(false)
    })
  })

  describe('isTask', () => {
    it('should return true for tasks', () => {
      expect(isTask(mockTask)).toBe(true)
    })

    it('should return false for non-tasks', () => {
      expect(isTask(mockFeature)).toBe(false)
      expect(isTask(mockBug)).toBe(false)
    })
  })
})

describe('Status Transitions', () => {
  describe('Feature Status Transitions', () => {
    it('should have correct transitions from backlog', () => {
      expect(FEATURE_STATUS_TRANSITIONS.backlog).toEqual(['planning'])
    })

    it('should have correct transitions from planning', () => {
      expect(FEATURE_STATUS_TRANSITIONS.planning).toEqual([
        'in-progress',
        'backlog',
      ])
    })

    it('should have correct transitions from in-progress', () => {
      expect(FEATURE_STATUS_TRANSITIONS['in-progress']).toEqual([
        'testing',
        'planning',
      ])
    })

    it('should have correct transitions from testing', () => {
      expect(FEATURE_STATUS_TRANSITIONS.testing).toEqual([
        'completed',
        'in-progress',
      ])
    })

    it('should have no transitions from completed', () => {
      expect(FEATURE_STATUS_TRANSITIONS.completed).toEqual([])
    })
  })

  describe('Bug Status Transitions', () => {
    it('should have correct transitions from open', () => {
      expect(BUG_STATUS_TRANSITIONS.open).toEqual(['in-progress', 'wont-fix'])
    })

    it('should have correct transitions from in-progress', () => {
      expect(BUG_STATUS_TRANSITIONS['in-progress']).toEqual([
        'resolved',
        'open',
      ])
    })

    it('should have correct transitions from resolved', () => {
      expect(BUG_STATUS_TRANSITIONS.resolved).toEqual(['closed', 'open'])
    })

    it('should have correct transitions from closed', () => {
      expect(BUG_STATUS_TRANSITIONS.closed).toEqual(['open'])
    })

    it('should have correct transitions from wont-fix', () => {
      expect(BUG_STATUS_TRANSITIONS['wont-fix']).toEqual(['open'])
    })
  })

  describe('Task Status Transitions', () => {
    it('should have correct transitions from todo', () => {
      expect(TASK_STATUS_TRANSITIONS.todo).toEqual(['in-progress'])
    })

    it('should have correct transitions from in-progress', () => {
      expect(TASK_STATUS_TRANSITIONS['in-progress']).toEqual([
        'blocked',
        'completed',
        'todo',
      ])
    })

    it('should have correct transitions from blocked', () => {
      expect(TASK_STATUS_TRANSITIONS.blocked).toEqual(['in-progress', 'todo'])
    })

    it('should have no transitions from completed', () => {
      expect(TASK_STATUS_TRANSITIONS.completed).toEqual([])
    })
  })
})
