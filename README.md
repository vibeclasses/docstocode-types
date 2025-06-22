# @vibeclasses/docstocode-types

Shared TypeScript types and schemas for project management applications.

## Features

- 🎯 **Type-safe** - Comprehensive TypeScript definitions with strict typing
- 🛡️ **Runtime validation** - JSON Schema validation with utilities
- 🌳 **Tree-shakable** - Modern ESM with separate entry points
- ⚡ **Zero dependencies** - Lightweight with peer dependencies only
- 🎨 **Modern TypeScript** - Uses latest TS features like const assertions, branded types, and discriminated unions

## Installation

```bash
npm install @vibeclasses/docstocode-types
# or
yarn add @vibeclasses/docstocode-types
# or
pnpm add @vibeclasses/docstocode-types
```

## Usage

### Basic Types

```typescript
import type {
  Feature,
  Bug,
  Task,
  ProjectData,
} from '@vibeclasses/docstocode-types'
import {
  createStoryPoints,
  isFeature,
  PRIORITIES,
} from '@vibeclasses/docstocode-types'

// Create a feature
const feature: Feature = {
  id: 'feat-001',
  type: 'feature',
  title: 'User Authentication',
  description: 'Implement OAuth 2.0 authentication',
  status: 'backlog',
  priority: 'high',
  tags: ['auth', 'security'],
  acceptanceCriteria: [
    'Users can log in with Google',
    'Users can log in with GitHub',
  ],
  storyPoints: createStoryPoints(8),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// Type guards
if (isFeature(item)) {
  console.log(item.storyPoints) // TypeScript knows this is a Feature
}
```

### Schema Validation

```typescript
import { SCHEMAS } from '@vibeclasses/docstocode-types/schemas'
import {
  validateFeature,
  ValidationError,
} from '@vibeclasses/docstocode-types/validators'

// Validate at runtime
try {
  validateFeature(data)
  console.log('Valid feature!')
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation errors:', error.errors)
  }
}

// Use with JSON Schema libraries
import Ajv from 'ajv'
const ajv = new Ajv()
const validate = ajv.compile(SCHEMAS.feature)
```

### Status Transitions

```typescript
import {
  canTransitionFeatureStatus,
  FEATURE_STATUS_TRANSITIONS,
} from '@vibeclasses/docstocode-types'

// Check if status transition is valid
const canMove = canTransitionFeatureStatus('planning', 'in-progress') // true
const cannotMove = canTransitionFeatureStatus('completed', 'backlog') // false

// Get all possible transitions
const possibleStates = FEATURE_STATUS_TRANSITIONS.planning // ['in-progress', 'backlog']
```

## API Reference

### Types

#### Core Types

- `Feature` - Feature/story items with acceptance criteria and story points
- `Bug` - Bug reports with severity and reproduction steps
- `Task` - General tasks with time tracking and subtasks
- `ProjectData` - Complete project data structure

#### Status Types

- `FeatureStatus` - `'backlog' | 'planning' | 'in-progress' | 'testing' | 'completed'`
- `BugStatus` - `'open' | 'in-progress' | 'resolved' | 'closed' | 'wont-fix'`
- `TaskStatus` - `'todo' | 'in-progress' | 'blocked' | 'completed'`

#### Utility Types

- `CreateItemInput<T>` - Input type for creating items (omits generated fields)
- `UpdateItemInput<T>` - Input type for updating items (makes most fields optional)
- `ItemsByType<T>` - Extract items of a specific type

### Constants

```typescript
export const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const
export const FEATURE_STATUSES = [
  'backlog',
  'planning',
  'in-progress',
  'testing',
  'completed',
] as const
// ... other status constants
```

### Type Guards

```typescript
isFeature(item: ProjectItem): item is Feature
isBug(item: ProjectItem): item is Bug
isTask(item: ProjectItem): item is Task
```

### Branded Types

```typescript
// Branded types for better type safety
type StoryPoints = number & { readonly __brand: 'StoryPoints' };
type Hours = number & { readonly __brand: 'Hours' };

// Helper functions
createStoryPoints(value: number): StoryPoints // Validates 1-21 range
createHours(value: number): Hours // Validates non-negative
```

## Entry Points

The package provides multiple entry points for optimal tree-shaking:

- `@vibeclasses/docstocode-types` - Main types and utilities
- `@vibeclasses/docstocode-types/schemas` - JSON Schema definitions
- `@vibeclasses/docstocode-types/validators` - Runtime validation utilities

## TypeScript Configuration

This package requires TypeScript 5.0+ and works best with these settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run type checking
npm run typecheck

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

### Versioning

This package uses automatic semantic versioning based on commit messages. See [VERSION_BUMPING.md](./VERSION_BUMPING.md) for details on how version bumping works.

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with appropriate tests
4. Ensure all tests pass and code is properly formatted
5. Submit a pull request

The CI/CD pipeline will automatically run tests, type checking, linting, and build verification on all pull requests.

## License

MIT
