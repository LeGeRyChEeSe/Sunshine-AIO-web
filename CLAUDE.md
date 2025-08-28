# Claude Development Guidelines

## Project Overview
This is the Sunshine-AIO Web Installer project - a React/TypeScript web application with Vite build system, deployed on Netlify. The project includes automated versioning, release management, and PowerShell installation scripts.

## Development Commands
**Always use `make` commands when available instead of raw npm/node/git commands.**

### Essential Commands
- `make help` - Show all available commands
- `make dev` - Start development server (usage: `make dev [PORT]`)
- `make build` - Build for production
- `make lint` - Run linting (must pass before commits)
- `make typecheck` - Run TypeScript checking
- `make test` - Run PowerShell tests

### Version Management
- `make version` - Show current version
- `make version-patch` - Bump patch version (bug fixes)
- `make version-minor` - Bump minor version (new features) 
- `make version-major` - Bump major version (breaking changes)

### Release Process
- `make release-patch` - Complete patch release
- `make release-minor` - Complete minor release
- `make release-major` - Complete major release
- `make ci` - Simulate full CI pipeline

### Git Operations
- `make git-status` - Check repository status
- `make git-log` - View recent commits
- `make git-sync` - Sync with remote repository

## Project Structure
- `/src` - React TypeScript source code
- `/public` - Static assets and PowerShell installation script
- `/scripts` - Node.js version/release management scripts
- `/tests` - PowerShell test scripts
- `/netlify` - Netlify Functions (TypeScript)

## Key Files to Understand
- `package.json` - npm scripts and dependencies
- `Makefile` - All project commands (use this!)
- `scripts/version.js` - Version management automation
- `scripts/release.js` - Release process automation
- `public/script.ps1` - Main PowerShell installer
- `tests/test-script.ps1` - Test simulation script

## Development Workflow
1. **Setup**: `make setup` (installs deps, builds, shows info)
2. **Development**: `make dev` for hot reload development (optionally specify port: `make dev 8080`)
3. **Before commits**: `make lint && make typecheck` must pass
4. **Testing**: `make test` to run PowerShell simulations
5. **Releases**: Use `make release-*` commands for automated releases

## Code Quality Requirements
- All TypeScript must pass `make typecheck`
- All code must pass `make lint` before commits  
- Follow existing React/TypeScript patterns in `/src`
- Maintain version synchronization across all files

## Versioning System
The project uses automated version management that synchronizes:
- `package.json`
- `version.txt`
- `public/script.ps1` 
- `tests/test-script.ps1`
- `CHANGELOG.md`

**Always use the `make version-*` or `make release-*` commands for version changes.**

## Testing Strategy
- Use `make test` for PowerShell script simulation
- Use `make test-skip` to skip update checks during testing
- PowerShell tests simulate the installation process without real changes
- Logs are saved to `%TEMP%\sunshine-aio-install-test.log`

## Deployment
- Production builds via `make build`
- Deployed automatically to Netlify on main branch pushes
- Use `make deploy-preview` to test deployment locally

## Emergency Procedures
- `make emergency-backup` - Create full project backup
- `make clean-install` - Clean rebuild from scratch
- `make git-clean` - Clean working directory

## Remember
- **Use `make` commands instead of raw npm/git commands**
- **Always run `make lint` and `make typecheck` before commits**
- **Use automated release process with `make release-*`**
- **Test PowerShell scripts with `make test` before releases**