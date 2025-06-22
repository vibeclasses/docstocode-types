import type { JSONSchema7 } from 'json-schema'
import {
  type ProjectItem,
  type Feature,
  type Bug,
  type Task,
  type ProjectData,
  isFeature,
  isBug,
  isTask,
  FEATURE_STATUS_TRANSITIONS,
  BUG_STATUS_TRANSITIONS,
  TASK_STATUS_TRANSITIONS,
} from './types.js'
import { SCHEMAS } from './schemas.js'

// Simple validation result type
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// Validation error class
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: string[],
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Basic JSON Schema validator (simplified)
 * In production, use ajv or similar library
 */
export class SimpleValidator {
  private validateSchema(data: unknown, schema: JSONSchema7): ValidationResult {
    const errors: string[] = []

    if (schema.type === 'object' && typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>

      // Check required fields
      if (Array.isArray(schema.required) && schema.required.length > 0) {
        for (const field of schema.required) {
          if (!(field in obj)) {
            errors.push(`Missing required field: ${field}`)
          }
        }
      }

      // Check properties
      if (schema.properties !== undefined && schema.properties !== null) {
        for (const [key, value] of Object.entries(obj)) {
          const fieldSchema = schema.properties[key] as JSONSchema7
          if (fieldSchema !== undefined) {
            const fieldResult = this.validateField(value, fieldSchema, key)
            errors.push(...fieldResult.errors)
          }
        }
      }
    } else if (schema.type !== undefined && typeof data !== schema.type) {
      errors.push(`Expected type ${schema.type}, got ${typeof data}`)
    }

    return { valid: errors.length === 0, errors }
  }

  private validateField(
    value: unknown,
    schema: JSONSchema7,
    fieldName: string,
  ): ValidationResult {
    const errors: string[] = []

    // Handle nullable fields
    if (
      Array.isArray(schema.type) &&
      schema.type.includes('null') &&
      value === null
    ) {
      return { valid: true, errors: [] }
    }

    // Type validation
    const expectedType = Array.isArray(schema.type)
      ? schema.type.find(t => t !== 'null')
      : schema.type

    if (expectedType !== undefined) {
      if (expectedType === 'array' && !Array.isArray(value)) {
        errors.push(`${fieldName}: Expected array, got ${typeof value}`)
        return { valid: false, errors }
      } else if (expectedType !== 'array' && typeof value !== expectedType) {
        errors.push(
          `${fieldName}: Expected ${expectedType}, got ${typeof value}`,
        )
        return { valid: false, errors }
      }
    }

    // String validations
    if (schema.type === 'string' && typeof value === 'string') {
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        errors.push(`${fieldName}: Minimum length is ${schema.minLength}`)
      }
      if (schema.maxLength !== undefined && value.length > schema.maxLength) {
        errors.push(`${fieldName}: Maximum length is ${schema.maxLength}`)
      }
      if (
        schema.pattern !== undefined &&
        !new RegExp(schema.pattern).test(value)
      ) {
        errors.push(`${fieldName}: Does not match pattern ${schema.pattern}`)
      }
    }

    // Number validations
    if (schema.type === 'number' && typeof value === 'number') {
      if (schema.minimum !== undefined && value < schema.minimum) {
        errors.push(`${fieldName}: Minimum value is ${schema.minimum}`)
      }
      if (schema.maximum !== undefined && value > schema.maximum) {
        errors.push(`${fieldName}: Maximum value is ${schema.maximum}`)
      }
    }

    // Enum validation
    if (Array.isArray(schema.enum) && !schema.enum.includes(value as never)) {
      errors.push(`${fieldName}: Must be one of ${schema.enum.join(', ')}`)
    }

    // Const validation
    if (schema.const !== undefined && value !== schema.const) {
      errors.push(`${fieldName}: Must be ${schema.const}`)
    }

    // Array validations
    if (schema.type === 'array' && Array.isArray(value)) {
      if (schema.minItems !== undefined && value.length < schema.minItems) {
        errors.push(`${fieldName}: Minimum items is ${schema.minItems}`)
      }
      if (schema.maxItems !== undefined && value.length > schema.maxItems) {
        errors.push(`${fieldName}: Maximum items is ${schema.maxItems}`)
      }
      if (schema.uniqueItems === true) {
        const uniqueValues = new Set(value)
        if (uniqueValues.size !== value.length) {
          errors.push(`${fieldName}: Items must be unique`)
        }
      }

      // Validate array items
      if (schema.items !== undefined && typeof schema.items === 'object') {
        for (let i = 0; i < value.length; i++) {
          const itemResult = this.validateField(
            value[i],
            schema.items as JSONSchema7,
            `${fieldName}[${i}]`,
          )
          errors.push(...itemResult.errors)
        }
      }
    }

    // Object validations (nested objects)
    if (
      schema.type === 'object' &&
      typeof value === 'object' &&
      value !== null
    ) {
      const nestedResult = this.validateSchema(value, schema)
      errors.push(...nestedResult.errors.map(error => `${fieldName}.${error}`))
    }

    return { valid: errors.length === 0, errors }
  }

  validate(data: unknown, schema: JSONSchema7): ValidationResult {
    // Handle direct type validation (not just object validation)
    if (schema.type !== 'object') {
      return this.validateField(data, schema, 'value')
    }
    return this.validateSchema(data, schema)
  }
}

// Validator instance
const validator = new SimpleValidator()

// Validation functions
export const validateFeature = (data: unknown): data is Feature => {
  const result = validator.validate(data, SCHEMAS.feature)
  if (!result.valid) {
    throw new ValidationError('Feature validation failed', result.errors)
  }
  return true
}

export const validateBug = (data: unknown): data is Bug => {
  const result = validator.validate(data, SCHEMAS.bug)
  if (!result.valid) {
    throw new ValidationError('Bug validation failed', result.errors)
  }
  return true
}

export const validateTask = (data: unknown): data is Task => {
  const result = validator.validate(data, SCHEMAS.task)
  if (!result.valid) {
    throw new ValidationError('Task validation failed', result.errors)
  }
  return true
}

export const validateProjectData = (data: unknown): data is ProjectData => {
  const result = validator.validate(data, SCHEMAS.projectData)
  if (!result.valid) {
    throw new ValidationError('Project data validation failed', result.errors)
  }
  return true
}

// Status transition validators
export const canTransitionFeatureStatus = (
  from: Feature['status'],
  to: Feature['status'],
): boolean => {
  return FEATURE_STATUS_TRANSITIONS[from].includes(to)
}

export const canTransitionBugStatus = (
  from: Bug['status'],
  to: Bug['status'],
): boolean => {
  return BUG_STATUS_TRANSITIONS[from].includes(to)
}

export const canTransitionTaskStatus = (
  from: Task['status'],
  to: Task['status'],
): boolean => {
  return TASK_STATUS_TRANSITIONS[from].includes(to)
}

// Generic status transition validator
export const canTransitionStatus = (
  item: ProjectItem,
  newStatus: string,
): boolean => {
  if (isFeature(item)) {
    return canTransitionFeatureStatus(
      item.status,
      newStatus as Feature['status'],
    )
  } else if (isBug(item)) {
    return canTransitionBugStatus(item.status, newStatus as Bug['status'])
  } else if (isTask(item)) {
    return canTransitionTaskStatus(item.status, newStatus as Task['status'])
  }
  return false
}

// Item validation with type discrimination
export const validateProjectItem = (data: unknown): data is ProjectItem => {
  if (typeof data !== 'object' || data === null) {
    throw new ValidationError('Invalid project item', ['Expected object'])
  }

  const item = data as { type?: string }

  switch (item.type) {
    case 'feature':
      return validateFeature(data)
    case 'bug':
      return validateBug(data)
    case 'task':
      return validateTask(data)
    default:
      throw new ValidationError('Invalid project item type', [
        `Expected 'feature', 'bug', or 'task', got '${item.type}'`,
      ])
  }
}

// Utility functions for safe validation
export const tryValidateFeature = (
  data: unknown,
): ValidationResult & { data?: Feature } => {
  try {
    validateFeature(data)
    return { valid: true, errors: [], data: data as Feature }
  } catch (error) {
    if (error instanceof ValidationError) {
      return { valid: false, errors: error.errors }
    }
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}

export const tryValidateBug = (
  data: unknown,
): ValidationResult & { data?: Bug } => {
  try {
    validateBug(data)
    return { valid: true, errors: [], data: data as Bug }
  } catch (error) {
    if (error instanceof ValidationError) {
      return { valid: false, errors: error.errors }
    }
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}

export const tryValidateTask = (
  data: unknown,
): ValidationResult & { data?: Task } => {
  try {
    validateTask(data)
    return { valid: true, errors: [], data: data as Task }
  } catch (error) {
    if (error instanceof ValidationError) {
      return { valid: false, errors: error.errors }
    }
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}
