// Re-export all types
export type {
  // Core types
  Priority,
  FeatureStatus,
  BugStatus,
  TaskStatus,
  Severity,
  BaseItem,
  Feature,
  Bug,
  Task,
  ProjectItem,
  ItemType,
  ProjectMetadata,
  ProjectData,
  
  // Branded types
  StoryPoints,
  Hours,
  
  // Utility types
  ItemsByType,
  ItemsOfType,
  CreateItemInput,
  UpdateItemInput,
  StatusTransitions
} from './types.js';

// Re-export constants
export {
  PRIORITIES,
  FEATURE_STATUSES,
  BUG_STATUSES,
  TASK_STATUSES,
  SEVERITIES,
  FEATURE_STATUS_TRANSITIONS,
  BUG_STATUS_TRANSITIONS,
  TASK_STATUS_TRANSITIONS
} from './types.js';

// Re-export type guards and utilities
export {
  isFeature,
  isBug,
  isTask,
  createStoryPoints,
  createHours
} from './types.js';

// Re-export schemas (separate entry point for tree-shaking)
export type { SchemaName } from './schemas.js';

// Re-export validation types and utilities (separate entry point)
export type { ValidationResult } from './validators.js';
export { ValidationError } from './validators.js';

// Version info
export const VERSION = '1.0.0';

// Package metadata
export const PACKAGE_INFO = {
  name: '@vibeclasses/docstocode-types',
  version: VERSION,
  description: 'Shared TypeScript types for DocsToCode'
} as const;