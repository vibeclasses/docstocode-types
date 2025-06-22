import { describe, it, expect } from 'vitest'
import {
  BASE_ITEM_SCHEMA,
  FEATURE_SCHEMA,
  BUG_SCHEMA,
  TASK_SCHEMA,
  PROJECT_DATA_SCHEMA,
  SCHEMAS,
  type SchemaName,
} from './schemas.js'

describe('Schema Structure', () => {
  describe('BASE_ITEM_SCHEMA', () => {
    it('should have correct type', () => {
      expect(BASE_ITEM_SCHEMA.type).toBe('object')
    })

    it('should have required fields', () => {
      expect(BASE_ITEM_SCHEMA.required).toEqual([
        'id',
        'title',
        'description',
        'status',
        'priority',
        'createdAt',
        'updatedAt',
      ])
    })

    it('should have correct properties structure', () => {
      expect(BASE_ITEM_SCHEMA.properties).toBeDefined()
      expect(BASE_ITEM_SCHEMA.properties.id).toEqual({
        type: 'string',
        minLength: 1,
        pattern: '^[a-zA-Z0-9_-]+$',
      })
      expect(BASE_ITEM_SCHEMA.properties.title).toEqual({
        type: 'string',
        minLength: 1,
        maxLength: 200,
      })
    })

    it('should disallow additional properties', () => {
      expect(BASE_ITEM_SCHEMA.additionalProperties).toBe(false)
    })
  })

  describe('FEATURE_SCHEMA', () => {
    it('should extend base schema', () => {
      expect(FEATURE_SCHEMA.type).toBe('object')
      expect(FEATURE_SCHEMA.required).toContain('id')
      expect(FEATURE_SCHEMA.required).toContain('type')
      expect(FEATURE_SCHEMA.required).toContain('acceptanceCriteria')
    })

    it('should have feature-specific properties', () => {
      expect(FEATURE_SCHEMA.properties.type).toEqual({ const: 'feature' })
      expect(FEATURE_SCHEMA.properties.acceptanceCriteria).toEqual({
        type: 'array',
        items: {
          type: 'string',
          minLength: 1,
        },
        minItems: 1,
      })
    })
  })

  describe('BUG_SCHEMA', () => {
    it('should extend base schema', () => {
      expect(BUG_SCHEMA.type).toBe('object')
      expect(BUG_SCHEMA.required).toContain('id')
      expect(BUG_SCHEMA.required).toContain('type')
      expect(BUG_SCHEMA.required).toContain('severity')
    })

    it('should have bug-specific properties', () => {
      expect(BUG_SCHEMA.properties.type).toEqual({ const: 'bug' })
      expect(BUG_SCHEMA.properties.reproducible).toEqual({ type: 'boolean' })
      expect(BUG_SCHEMA.properties.stepsToReproduce).toEqual({
        type: 'array',
        items: {
          type: 'string',
          minLength: 1,
        },
        minItems: 1,
      })
    })
  })

  describe('TASK_SCHEMA', () => {
    it('should extend base schema', () => {
      expect(TASK_SCHEMA.type).toBe('object')
      expect(TASK_SCHEMA.required).toContain('id')
      expect(TASK_SCHEMA.required).toContain('type')
      expect(TASK_SCHEMA.required).toContain('subtasks')
    })

    it('should have task-specific properties', () => {
      expect(TASK_SCHEMA.properties.type).toEqual({ const: 'task' })
      expect(TASK_SCHEMA.properties.subtasks).toEqual({
        type: 'array',
        items: {
          type: 'string',
          pattern: '^[a-zA-Z0-9_-]+$',
        },
        uniqueItems: true,
      })
    })
  })

  describe('PROJECT_DATA_SCHEMA', () => {
    it('should have correct structure', () => {
      expect(PROJECT_DATA_SCHEMA.type).toBe('object')
      expect(PROJECT_DATA_SCHEMA.required).toEqual([
        'features',
        'bugs',
        'tasks',
        'metadata',
      ])
    })

    it('should have correct array properties', () => {
      expect(PROJECT_DATA_SCHEMA.properties.features).toEqual({
        type: 'array',
        items: FEATURE_SCHEMA,
      })
      expect(PROJECT_DATA_SCHEMA.properties.bugs).toEqual({
        type: 'array',
        items: BUG_SCHEMA,
      })
      expect(PROJECT_DATA_SCHEMA.properties.tasks).toEqual({
        type: 'array',
        items: TASK_SCHEMA,
      })
    })

    it('should have metadata schema', () => {
      const metadata = PROJECT_DATA_SCHEMA.properties.metadata
      expect(metadata.type).toBe('object')
      expect(metadata.required).toEqual([
        'projectName',
        'version',
        'lastUpdated',
      ])
      expect(metadata.properties.version).toEqual({
        type: 'string',
        pattern: '^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9]+)?$',
      })
    })
  })
})

describe('SCHEMAS Registry', () => {
  it('should contain all schemas', () => {
    expect(SCHEMAS.baseItem).toBe(BASE_ITEM_SCHEMA)
    expect(SCHEMAS.feature).toBe(FEATURE_SCHEMA)
    expect(SCHEMAS.bug).toBe(BUG_SCHEMA)
    expect(SCHEMAS.task).toBe(TASK_SCHEMA)
    expect(SCHEMAS.projectData).toBe(PROJECT_DATA_SCHEMA)
  })

  it('should have correct schema names', () => {
    const expectedNames: SchemaName[] = [
      'baseItem',
      'feature',
      'bug',
      'task',
      'projectData',
    ]
    const actualNames = Object.keys(SCHEMAS) as SchemaName[]
    expect(actualNames.sort()).toEqual(expectedNames.sort())
  })
})
