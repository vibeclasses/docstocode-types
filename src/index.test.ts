import { describe, it, expect } from 'vitest'
import {
  // Types
  Priority,
  FeatureStatus,
  BugStatus,
  TaskStatus,
  Severity,
  Feature,
  Bug,
  Task,
  ProjectItem,
  ItemType,
  ProjectMetadata,
  ProjectData,
  StoryPoints,
  Hours,
  ItemsByType,
  ItemsOfType,
  CreateItemInput,
  UpdateItemInput,
  StatusTransitions,

  // Constants
  PRIORITIES,
  FEATURE_STATUSES,
  BUG_STATUSES,
  TASK_STATUSES,
  SEVERITIES,
  FEATURE_STATUS_TRANSITIONS,
  BUG_STATUS_TRANSITIONS,
  TASK_STATUS_TRANSITIONS,

  // Type guards and utilities
  isFeature,
  isBug,
  isTask,
  createStoryPoints,
  createHours,

  // Schema types
  SchemaName,

  // Validation
  ValidationResult,
  ValidationError,

  // Package info
  VERSION,
  PACKAGE_INFO,
} from './index.js'

describe('Index Exports', () => {
  describe('Package Information', () => {
    it('should export version', () => {
      expect(VERSION).toBe('1.0.0')
    })

    it('should export package info', () => {
      expect(PACKAGE_INFO).toEqual({
        name: '@vibeclasses/docstocode-types',
        version: '1.0.0',
        description: 'Shared TypeScript types for DocsToCode',
      })
    })
  })

  describe('Constants Export', () => {
    it('should export all priority constants', () => {
      expect(PRIORITIES).toEqual(['low', 'medium', 'high', 'critical'])
    })

    it('should export all status constants', () => {
      expect(FEATURE_STATUSES).toEqual([
        'backlog',
        'planning',
        'in-progress',
        'testing',
        'completed',
      ])
      expect(BUG_STATUSES).toEqual([
        'open',
        'in-progress',
        'resolved',
        'closed',
        'wont-fix',
      ])
      expect(TASK_STATUSES).toEqual([
        'todo',
        'in-progress',
        'blocked',
        'completed',
      ])
    })

    it('should export severity constants', () => {
      expect(SEVERITIES).toEqual(['low', 'medium', 'high', 'critical'])
    })

    it('should export status transition maps', () => {
      expect(FEATURE_STATUS_TRANSITIONS).toBeDefined()
      expect(BUG_STATUS_TRANSITIONS).toBeDefined()
      expect(TASK_STATUS_TRANSITIONS).toBeDefined()
    })
  })

  describe('Type Guards Export', () => {
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

    it('should export working type guards', () => {
      expect(isFeature(mockFeature)).toBe(true)
      expect(isFeature(mockBug)).toBe(false)

      expect(isBug(mockBug)).toBe(true)
      expect(isBug(mockFeature)).toBe(false)

      expect(isTask(mockTask)).toBe(true)
      expect(isTask(mockFeature)).toBe(false)
    })
  })

  describe('Branded Type Utilities Export', () => {
    it('should export story points creator', () => {
      expect(createStoryPoints(5)).toBe(5)
      expect(() => createStoryPoints(0)).toThrow()
    })

    it('should export hours creator', () => {
      expect(createHours(8)).toBe(8)
      expect(() => createHours(-1)).toThrow()
    })
  })

  describe('Validation Exports', () => {
    it('should export ValidationError class', () => {
      const error = new ValidationError('Test error', ['error1'])
      expect(error).toBeInstanceOf(ValidationError)
      expect(error.errors).toEqual(['error1'])
    })
  })

  describe('Type Utility Verification', () => {
    it('should handle ItemsByType correctly', () => {
      // This is a compile-time test - if it compiles, the types work
      type FeatureType = ItemsByType<'feature'>
      type BugType = ItemsByType<'bug'>
      type TaskType = ItemsByType<'task'>

      // Type assertions to verify the types are correct
      const feature: FeatureType = {
        id: 'f1',
        title: 'Test',
        description: 'Test',
        type: 'feature',
        status: 'backlog',
        priority: 'medium',
        tags: [],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        acceptanceCriteria: ['test'],
      }

      expect(feature.type).toBe('feature')
    })

    it('should handle CreateItemInput correctly', () => {
      type CreateFeatureInput = CreateItemInput<Feature>

      const input: CreateFeatureInput = {
        title: 'New Feature',
        description: 'Description',
        type: 'feature',
        status: 'backlog',
        priority: 'medium',
        tags: [],
        acceptanceCriteria: ['test'],
      }

      expect(input.title).toBe('New Feature')
    })

    it('should handle UpdateItemInput correctly', () => {
      type UpdateFeatureInput = UpdateItemInput<Feature>

      const input: UpdateFeatureInput = {
        id: 'f1',
        title: 'Updated Feature',
      }

      expect(input.id).toBe('f1')
      expect(input.title).toBe('Updated Feature')
    })
  })
})
