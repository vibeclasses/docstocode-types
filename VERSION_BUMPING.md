# Automatic Version Bumping

This repository uses automatic semantic version bumping based on commit messages when pushing to the `main` branch or creating releases.

## Version Bump Rules

The CI/CD pipeline analyzes commit messages to determine the appropriate version bump:

### Patch Version (x.x.X)
**Triggered by:** Commit messages containing `bug` or `fix` (case-insensitive)
- Bug fixes
- Small corrections
- Security patches

**Examples:**
- `fix: resolve validation error in schemas`
- `bug: incorrect type guard logic`
- `Fix broken import paths`

### Major Version (X.x.x)
**Triggered by:** Commit messages containing `release` (case-insensitive)
- Breaking changes
- Major feature releases
- API changes that break backward compatibility

**Examples:**
- `release: new validation system with breaking changes`
- `Release v2.0.0 with new schema format`
- `RELEASE: Complete API overhaul`

### Minor Version (x.X.x)
**Triggered by:** All other commit messages (default behavior)
- New features
- Enhancements
- Non-breaking changes

**Examples:**
- `feat: add new task status transitions`
- `Add support for custom validators`
- `Update schemas with new optional fields`

## Skipping Version Bumps

To skip automatic version bumping, include `[skip version]` in your commit message:

```
docs: update README [skip version]
chore: update dependencies [skip version]
```

## How It Works

### On Push to Main Branch
1. **Auto Version Bump Job**: Automatically runs after all tests pass
2. **Version Determination**: Analyzes the latest commit message
3. **Version Update**: Updates `package.json` and `package-lock.json`
4. **Git Tag**: Creates and pushes a new git tag (e.g., `v1.2.3`)
5. **Commit**: Pushes the version bump commit with `[skip ci]`

### On GitHub Release
1. **Manual Release**: Create a release through GitHub UI
2. **Version Bump**: Same logic applies based on release notes/commit message
3. **NPM Publish**: Automatically publishes to NPM registry
4. **Release Update**: Updates the release with the new version number

## Best Practices

1. **Write Clear Commit Messages**: Use descriptive messages that indicate the type of change
2. **Use Conventional Commits**: Consider following conventional commit format for consistency
3. **Test Before Merging**: Ensure all tests pass before merging to main
4. **Review Changes**: Use pull requests to review changes before they trigger version bumps

## Examples

```bash
# Patch version bump (1.0.0 → 1.0.1)
git commit -m "fix: resolve memory leak in validator"

# Minor version bump (1.0.1 → 1.1.0)  
git commit -m "feat: add new project schema validation"

# Major version bump (1.1.0 → 2.0.0)
git commit -m "release: breaking changes to schema format"

# No version bump
git commit -m "docs: update API documentation [skip version]"
```

## Manual Version Control

If you need to manually control versioning, you can:

1. Include `[skip version]` in commit messages
2. Manually run `npm version [patch|minor|major]` locally
3. Create releases manually through GitHub UI with specific version tags