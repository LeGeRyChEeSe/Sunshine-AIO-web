# Versioning Scripts

This folder contains the automated scripts for project version management.

## Available Scripts

### `version.js`
Main version management script.

**Usage:**
```bash
# Show current version
node scripts/version.js current

# Increment versions
node scripts/version.js bump major ["message"]
node scripts/version.js bump minor ["message"] 
node scripts/version.js bump patch ["message"]
node scripts/version.js bump prerelease ["message"] ["alpha"|"beta"|"rc"]

# Initialize changelog
node scripts/version.js init

# Add changelog entry
node scripts/version.js changelog "1.2.0" "Description of changes"
```

### `release.js`
Complete release automation script.

**Usage:**
```bash
# Complete releases (tests + build + commit + tag)
node scripts/release.js major "Breaking changes description"
node scripts/release.js minor "New features description"
node scripts/release.js patch "Bug fixes description" 
node scripts/release.js hotfix "Urgent fix description"
node scripts/release.js prerelease "Pre-release description"
```

## Features

### Multi-file Synchronization
Scripts automatically synchronize versions across:
- `package.json`
- `version.txt` 
- `public/script.ps1`
- `tests/test-script.ps1`
- `CHANGELOG.md`

### Automated Release Process
1. Git status verification
2. Test execution (if available)
3. Linting verification
4. Project build
5. Version updates
6. Changelog entry generation
7. Changes commit
8. Git tag creation

### Semantic Versioning Format
- **MAJOR**: Breaking changes (1.0.0 → 2.0.0)
- **MINOR**: New features (1.0.0 → 1.1.0)
- **PATCH**: Bug fixes (1.0.0 → 1.0.1)
- **PRERELEASE**: Development versions (1.0.0 → 1.0.1-alpha.1)

## NPM Integration

Scripts are integrated as npm commands in `package.json`:

```json
{
  "scripts": {
    "version:current": "node scripts/version.js current",
    "version:bump:major": "node scripts/version.js bump major",
    "version:bump:minor": "node scripts/version.js bump minor", 
    "version:bump:patch": "node scripts/version.js bump patch",
    "version:prerelease": "node scripts/version.js bump prerelease",
    "version:init": "node scripts/version.js init",
    "release:major": "node scripts/release.js major",
    "release:minor": "node scripts/release.js minor",
    "release:patch": "node scripts/release.js patch",
    "release:hotfix": "node scripts/release.js hotfix",
    "release:prerelease": "node scripts/release.js prerelease"
  }
}
```

## Usage Examples

### Bug Fix Release
```bash
npm run release:patch "Fix authentication timeout issue"
```

### New Feature Release  
```bash
npm run release:minor "Add dark mode support"
```

### Urgent Hotfix
```bash
npm run release:hotfix "Fix critical security vulnerability"
```

### Development Version
```bash
npm run release:prerelease "Add experimental AI features"
```

## Customization

### Modify Synchronized Files
Edit the `VersionManager` class in `version.js`:

```javascript
constructor() {
    this.packageJsonPath = join(this.rootDir, 'package.json');
    this.versionFilePath = join(this.rootDir, 'version.txt');
    this.changelogPath = join(this.rootDir, 'CHANGELOG.md');
    // Add other files here
}
```

### Customize Changelog Format
Modify the `addChangelogEntry()` method to change entry format.

### Add Pre-Release Checks
Edit `release.js` to add custom steps to the release process.

## Troubleshooting

### Common Errors

**Inconsistent version between files:**
```bash
node scripts/version.js current
# Check all files manually
```

**Commit failed:**
```bash
git status
# Resolve conflicts then retry
```

**Build/Test failed:**
```bash
npm run build
npm test  
# Fix errors before release
```

**Git tag exists:**
```bash
git tag -d v1.2.0
# Remove tag then retry
```