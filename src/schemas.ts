import type { JSONSchema7 } from 'json-schema'
import {
  PRIORITIES,
  FEATURE_STATUSES,
  BUG_STATUSES,
  TASK_STATUSES,
  SEVERITIES,
} from './types.js'

// Use const assertions with TypeScript for schema definitions
const createEnumSchema = <T extends readonly string[]>(values: T) => ({
  type: 'string' as const,
  enum: [...values],
})

// Base item schema with strict typing
export const BASE_ITEM_SCHEMA = {
  type: 'object',
  required: [
    'id',
    'title',
    'description',
    'status',
    'priority',
    'createdAt',
    'updatedAt',
  ],
  properties: {
    id: {
      type: 'string',
      minLength: 1,
      pattern: '^[a-zA-Z0-9_-]+$', // Add ID format validation
    },
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 200,
    },
    description: {
      type: 'string',
      maxLength: 2000,
    },
    priority: createEnumSchema(PRIORITIES),
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
    },
  },
  additionalProperties: false,
} as const satisfies JSONSchema7

// Feature schema
export const FEATURE_SCHEMA = {
  ...BASE_ITEM_SCHEMA,
  properties: {
    ...BASE_ITEM_SCHEMA.properties,
    type: { const: 'feature' },
    status: createEnumSchema(FEATURE_STATUSES),
    epic: {
      type: ['string', 'null'],
      minLength: 1,
    },
    acceptanceCriteria: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
      },
      minItems: 1,
    },
  },
  required: [...BASE_ITEM_SCHEMA.required, 'type', 'acceptanceCriteria'],
} as const satisfies JSONSchema7

// Bug schema
export const BUG_SCHEMA = {
  ...BASE_ITEM_SCHEMA,
  properties: {
    ...BASE_ITEM_SCHEMA.properties,
    type: { const: 'bug' },
    status: createEnumSchema(BUG_STATUSES),
    severity: createEnumSchema(SEVERITIES),
    reproducible: { type: 'boolean' },
    stepsToReproduce: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
      },
      minItems: 1,
    },
    environment: {
      type: 'string',
      minLength: 1,
    },
    resolution: {
      type: ['string', 'null'],
      minLength: 1,
    },
  },
  required: [
    ...BASE_ITEM_SCHEMA.required,
    'type',
    'severity',
    'reproducible',
    'stepsToReproduce',
    'environment',
  ],
} as const satisfies JSONSchema7

// Task schema
export const TASK_SCHEMA = {
  ...BASE_ITEM_SCHEMA,
  properties: {
    ...BASE_ITEM_SCHEMA.properties,
    type: { const: 'task' },
    status: createEnumSchema(TASK_STATUSES),
    subtasks: {
      type: 'array',
      items: {
        type: 'string',
        pattern: '^[a-zA-Z0-9_-]+$', // Subtask IDs
      },
      uniqueItems: true,
    },
  },
  required: [...BASE_ITEM_SCHEMA.required, 'type', 'subtasks'],
} as const satisfies JSONSchema7

// Project data schema
export const PROJECT_DATA_SCHEMA = {
  type: 'object',
  required: ['features', 'bugs', 'tasks', 'metadata'],
  properties: {
    features: {
      type: 'array',
      items: FEATURE_SCHEMA,
    },
    bugs: {
      type: 'array',
      items: BUG_SCHEMA,
    },
    tasks: {
      type: 'array',
      items: TASK_SCHEMA,
    },
    metadata: {
      type: 'object',
      required: ['projectName', 'version', 'lastUpdated'],
      properties: {
        projectName: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
        },
        version: {
          type: 'string',
          pattern: '^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9]+)?$', // Semantic versioning
        },
        lastUpdated: {
          type: 'string',
          format: 'date-time',
        },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
} as const satisfies JSONSchema7

// Schema registry for easy access
export const SCHEMAS = {
  baseItem: BASE_ITEM_SCHEMA,
  feature: FEATURE_SCHEMA,
  bug: BUG_SCHEMA,
  task: TASK_SCHEMA,
  projectData: PROJECT_DATA_SCHEMA,
} as const

// Type for schema names
export type SchemaName = keyof typeof SCHEMAS
