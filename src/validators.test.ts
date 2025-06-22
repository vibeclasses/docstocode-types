import { describe, it, expect } from 'vitest'
import {
  ValidationError,
  SimpleValidator,
  validateFeature,
  validateBug,
  validateTask,
  validateProjectData,
  validateProjectItem,
  canTransitionFeatureStatus,
  canTransitionBugStatus,
  canTransitionTaskStatus,
  canTransitionStatus,
  tryValidateFeature,
  tryValidateBug,
  tryValidateTask,
  type Feature,
  type Bug,
  type Task,
  type ProjectData,
} from './validators.js'

// Test data objects used across multiple test suites
const validFeature: Feature = {
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

const validBug: Bug = {
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

const validTask: Task = {
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

describe('ValidationError', () => {
  it('should create error with message and errors', () => {
    const errors = ['Field required', 'Invalid type']
    const error = new ValidationError('Validation failed', errors)

    expect(error.message).toBe('Validation failed')
    expect(error.errors).toEqual(errors)
    expect(error.name).toBe('ValidationError')
  })
})

describe('SimpleValidator', () => {
  const validator = new SimpleValidator()

  describe('Basic validation', () => {
    it('should validate simple object schema', () => {
      const schema = {
        type: 'object' as const,
        required: ['name'],
        properties: {
          name: { type: 'string' as const },
        },
      }

      const validData = { name: 'test' }
      const invalidData = {}

      expect(validator.validate(validData, schema)).toEqual({
        valid: true,
        errors: [],
      })

      expect(validator.validate(invalidData, schema)).toEqual({
        valid: false,
        errors: ['Missing required field: name'],
      })
    })

    it('should validate string constraints', () => {
      const schema = {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string' as const,
            minLength: 2,
            maxLength: 10,
            pattern: '^[a-zA-Z]+$',
          },
        },
      }

      expect(validator.validate({ name: 'ab' }, schema).valid).toBe(true)
      expect(validator.validate({ name: 'a' }, schema).valid).toBe(false)
      expect(validator.validate({ name: 'verylongname' }, schema).valid).toBe(
        false,
      )
      expect(validator.validate({ name: 'test123' }, schema).valid).toBe(false)
    })

    it('should validate enum values', () => {
      const schema = {
        type: 'object' as const,
        properties: {
          status: {
            type: 'string' as const,
            enum: ['active', 'inactive'],
          },
        },
      }

      expect(validator.validate({ status: 'active' }, schema).valid).toBe(true)
      expect(validator.validate({ status: 'pending' }, schema).valid).toBe(
        false,
      )
    })

    it('should validate const values', () => {
      const schema = {
        type: 'object' as const,
        properties: {
          type: { const: 'feature' },
        },
      }

      expect(validator.validate({ type: 'feature' }, schema).valid).toBe(true)
      expect(validator.validate({ type: 'bug' }, schema).valid).toBe(false)
    })

    it('should handle nullable fields', () => {
      const schema = {
        type: 'object' as const,
        properties: {
          optional: {
            type: ['string', 'null'] as const,
          },
        },
      }

      expect(validator.validate({ optional: 'value' }, schema).valid).toBe(true)
      expect(validator.validate({ optional: null }, schema).valid).toBe(true)
    })
  })
})

describe('Item Validation', () => {
  describe('validateFeature', () => {
    it('should validate valid feature', () => {
      expect(() => validateFeature(validFeature)).not.toThrow()
      expect(validateFeature(validFeature)).toBe(true)
    })

    it('should throw for invalid feature', () => {
      const invalidFeature = { ...validFeature, acceptanceCriteria: [] }
      expect(() => validateFeature(invalidFeature)).toThrow(ValidationError)
    })
  })

  describe('validateBug', () => {
    it('should validate valid bug', () => {
      expect(() => validateBug(validBug)).not.toThrow()
      expect(validateBug(validBug)).toBe(true)
    })

    it('should throw for invalid bug', () => {
      const invalidBug = { ...validBug, stepsToReproduce: [] }
      expect(() => validateBug(invalidBug)).toThrow(ValidationError)
    })
  })

  describe('validateTask', () => {
    it('should validate valid task', () => {
      expect(() => validateTask(validTask)).not.toThrow()
      expect(validateTask(validTask)).toBe(true)
    })

    it('should throw for missing required fields', () => {
      const invalidTask = { ...validTask }
      delete (invalidTask as any).subtasks
      expect(() => validateTask(invalidTask)).toThrow(ValidationError)
    })
  })

  describe('validateProjectItem', () => {
    it('should validate features', () => {
      expect(validateProjectItem(validFeature)).toBe(true)
    })

    it('should validate bugs', () => {
      expect(validateProjectItem(validBug)).toBe(true)
    })

    it('should validate tasks', () => {
      expect(validateProjectItem(validTask)).toBe(true)
    })

    it('should throw for invalid type', () => {
      const invalidItem = { ...validFeature, type: 'invalid' }
      expect(() => validateProjectItem(invalidItem)).toThrow(ValidationError)
    })

    it('should throw for non-object', () => {
      expect(() => validateProjectItem('not an object')).toThrow(
        ValidationError,
      )
    })
  })

  describe('validateProjectData', () => {
    const validProjectData: ProjectData = {
      features: [validFeature],
      bugs: [validBug],
      tasks: [validTask],
      metadata: {
        projectName: 'Test Project',
        version: '1.0.0',
        lastUpdated: '2023-01-01T00:00:00Z',
      },
    }

    it('should validate valid project data', () => {
      expect(() => validateProjectData(validProjectData)).not.toThrow()
      expect(validateProjectData(validProjectData)).toBe(true)
    })

    it('should throw for invalid version format', () => {
      const invalidData = {
        ...validProjectData,
        metadata: {
          ...validProjectData.metadata,
          version: 'invalid-version',
        },
      }
      expect(() => validateProjectData(invalidData)).toThrow(ValidationError)
    })
  })
})

describe('Status Transitions', () => {
  describe('canTransitionFeatureStatus', () => {
    it('should allow valid transitions', () => {
      expect(canTransitionFeatureStatus('backlog', 'planning')).toBe(true)
      expect(canTransitionFeatureStatus('planning', 'in-progress')).toBe(true)
      expect(canTransitionFeatureStatus('testing', 'completed')).toBe(true)
    })

    it('should deny invalid transitions', () => {
      expect(canTransitionFeatureStatus('backlog', 'completed')).toBe(false)
      expect(canTransitionFeatureStatus('completed', 'testing')).toBe(false)
    })
  })

  describe('canTransitionBugStatus', () => {
    it('should allow valid transitions', () => {
      expect(canTransitionBugStatus('open', 'in-progress')).toBe(true)
      expect(canTransitionBugStatus('resolved', 'closed')).toBe(true)
      expect(canTransitionBugStatus('closed', 'open')).toBe(true)
    })

    it('should deny invalid transitions', () => {
      expect(canTransitionBugStatus('open', 'closed')).toBe(false)
      expect(canTransitionBugStatus('wont-fix', 'resolved')).toBe(false)
    })
  })

  describe('canTransitionTaskStatus', () => {
    it('should allow valid transitions', () => {
      expect(canTransitionTaskStatus('todo', 'in-progress')).toBe(true)
      expect(canTransitionTaskStatus('in-progress', 'blocked')).toBe(true)
      expect(canTransitionTaskStatus('blocked', 'in-progress')).toBe(true)
    })

    it('should deny invalid transitions', () => {
      expect(canTransitionTaskStatus('todo', 'completed')).toBe(false)
      expect(canTransitionTaskStatus('completed', 'blocked')).toBe(false)
    })
  })

  describe('canTransitionStatus', () => {
    it('should handle feature transitions', () => {
      expect(canTransitionStatus(validFeature, 'planning')).toBe(true)
      expect(canTransitionStatus(validFeature, 'completed')).toBe(false)
    })

    it('should handle bug transitions', () => {
      expect(canTransitionStatus(validBug, 'in-progress')).toBe(true)
      expect(canTransitionStatus(validBug, 'closed')).toBe(false)
    })

    it('should handle task transitions', () => {
      expect(canTransitionStatus(validTask, 'in-progress')).toBe(true)
      expect(canTransitionStatus(validTask, 'completed')).toBe(false)
    })
  })
})

describe('Safe Validation Functions', () => {
  const validFeature: Feature = {
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

  describe('tryValidateFeature', () => {
    it('should return success for valid feature', () => {
      const result = tryValidateFeature(validFeature)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
      expect(result.data).toEqual(validFeature)
    })

    it('should return errors for invalid feature', () => {
      const invalidFeature = { ...validFeature, acceptanceCriteria: [] }
      const result = tryValidateFeature(invalidFeature)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.data).toBeUndefined()
    })
  })

  describe('tryValidateBug', () => {
    const validBug: Bug = {
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

    it('should return success for valid bug', () => {
      const result = tryValidateBug(validBug)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
      expect(result.data).toEqual(validBug)
    })

    it('should return errors for invalid bug', () => {
      const invalidBug = { ...validBug, stepsToReproduce: [] }
      const result = tryValidateBug(invalidBug)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.data).toBeUndefined()
    })
  })

  describe('tryValidateTask', () => {
    const validTask: Task = {
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

    it('should return success for valid task', () => {
      const result = tryValidateTask(validTask)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
      expect(result.data).toEqual(validTask)
    })

    it('should return errors for invalid task', () => {
      const invalidTask = { ...validTask }
      delete (invalidTask as any).subtasks
      const result = tryValidateTask(invalidTask)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.data).toBeUndefined()
    })
  })
})
