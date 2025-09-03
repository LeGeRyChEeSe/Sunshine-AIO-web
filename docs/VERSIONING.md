# Versioning System

This project uses an automated versioning system based on [Semantic Versioning](https://semver.org/).

## Version Structure

The version format follows the `MAJOR.MINOR.PATCH[-PRERELEASE]` schema:

- **MAJOR**: Breaking changes incompatible with previous versions
- **MINOR**: New backward-compatible functionality  
- **PATCH**: Backward-compatible bug fixes
- **PRERELEASE**: Pre-release versions (alpha, beta, rc)

## Available Scripts

### Version Scripts

```bash
# Show current version
npm run version:current

# Increment versions
npm run version:bump:major    # 1.0.0 → 2.0.0
npm run version:bump:minor    # 1.0.0 → 1.1.0  
npm run version:bump:patch    # 1.0.0 → 1.0.1
npm run version:prerelease    # 1.0.0 → 1.0.1-alpha.1

# Initialize changelog
npm run version:init
```

### Release Scripts

```bash
# Complete releases (with tests, build, commit and tag)
npm run release:major "Breaking changes description"
npm run release:minor "New features description"  
npm run release:patch "Bug fixes description"
npm run release:hotfix "Urgent fix description"
npm run release:prerelease "Pre-release description"
```

## Release Process

Release scripts automate the complete process:

1. **Git Verification**: Checks repository status
2. **Tests**: Runs tests (if available)
3. **Linting**: Checks code quality
4. **Build**: Compiles the project
5. **Bump Version**: Updates all version files
6. **Changelog**: Adds changelog entry
7. **Commit**: Creates commit with changes
8. **Tag**: Creates Git tag for the version

## Synchronized Files

The system automatically updates:

- `package.json` - npm version
- `version.txt` - standalone version file
- `public/script.ps1` - main PowerShell script
- `tests/test-script.ps1` - test PowerShell script
- `CHANGELOG.md` - change log

## Manual Usage

### Node.js Scripts

```bash
# Direct script usage
node scripts/version.js current
node scripts/version.js bump patch "Fix critical bug"
node scripts/release.js patch "Fix authentication issue"
```

### Available Parameters

```javascript
// Supported bump types
- major: Breaking changes
- minor: New features
- patch: Bug fixes  
- prerelease: Pre-release (with alpha/beta/rc suffix)
```

## Git Workflow

### Normal Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Develop and test
# ... commits ...

# Minor release for new feature
npm run release:minor "Add user authentication system"

# Push with tags
git push origin feature/new-feature --tags
```

### Urgent Hotfix

```bash
# Create hotfix branch
git checkout -b hotfix/security-patch

# Fix the issue
# ... commits ...

# Hotfix release
npm run release:hotfix "Fix XSS vulnerability in user input"

# Quick merge to production
git push origin hotfix/security-patch --tags
```

### Pre-release

```bash
# Create test versions
npm run release:prerelease "Add experimental dark mode"
# → v1.2.0-alpha.1

npm run release:prerelease "Improve dark mode performance"  
# → v1.2.0-alpha.2

# Final release
npm run release:minor "Add dark mode support"
# → v1.2.0
```

## Changelog Format

The changelog follows [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [1.2.0] - 2024-01-15

### Added
- New feature X
- Support for Y

### Changed  
- Improved Z

### Fixed
- Fixed bug A
- Resolved issue B

### Security
- Fixed vulnerability C
```

## Best Practices

### Commit Messages

```bash
# Good format for release commits
npm run release:patch "
### Fixed
- Fix user authentication timeout
- Resolve memory leak in dashboard
- Correct typos in French translations
"
```

### Pre-Release Checks

- ✅ Tests pass
- ✅ Build succeeds  
- ✅ Linting passes
- ✅ Documentation updated
- ✅ Changelog filled

### Release Types

- **Patch**: Bug fixes, typos, minor optimizations
- **Minor**: New features, UX improvements
- **Major**: API changes, restructuring, breaking changes
- **Hotfix**: Urgent security/production fixes

## CI/CD Integration

The system can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Release
  run: npm run release:patch "${{ github.event.head_commit.message }}"
  
- name: Push tags
  run: git push origin --tags
```

## Troubleshooting

### Common Issues

1. **Inconsistent version**: Use `npm run version:current` to check
2. **Commit failed**: Check Git status with `git status`
3. **Build failed**: Resolve errors before release
4. **Tag exists**: Remove with `git tag -d v1.0.0`

### Reset

```bash
# Reset to specific version
node scripts/version.js bump patch
# Then manually edit files if needed
```