# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based web application that serves as the installer and downloader for Sunshine-AIO, a game streaming application. The website provides installation scripts, documentation, and an AI-powered chat assistant to help users with setup and troubleshooting.

## Development Commands

**Always use `make` commands when available instead of raw npm/node/git commands.**

### Essential Commands
- `make help` - Show all available commands
- `make setup` - Complete project setup (install + build + info)
- `make dev` - Start development server (usage: `make dev [PORT]`)
- `make build` - Build for production
- `make lint` - Run linting (must pass before commits)
- `make lint-fix` - Run ESLint and automatically fix issues
- `make typecheck` - Run TypeScript checking
- `make test` - Run PowerShell tests

### Development & Build Commands
- `make install` - Install project dependencies
- `make build-styles` - Build CSS styles with PostCSS
- `make preview` - Preview the built application locally
- `make watch-styles` - Watch and build styles on change
- `make serve-public` - Serve public directory (for testing static files)

### Testing Commands
- `make test` - Run PowerShell test scripts
- `make test-skip` - Run tests skipping update checks
- `make test-custom` - Run tests with custom repository (usage: make test-custom REPO=your-repo)

### Version Management
- `make version` - Show current version
- `make version-patch` - Bump patch version (bug fixes)
- `make version-minor` - Bump minor version (new features) 
- `make version-major` - Bump major version (breaking changes)
- `make version-prerelease` - Bump prerelease version (alpha/beta)
- `make version-init` - Initialize versioning system

### Release Process
- `make release-patch` - Complete patch release
- `make release-minor` - Complete minor release
- `make release-major` - Complete major release
- `make release-hotfix` - Complete hotfix release for urgent fixes
- `make release-prerelease` - Complete prerelease for development versions
- `make ci` - Simulate full CI pipeline (lint, typecheck, build, test)

### Git Operations
- `make git-status` - Check repository status
- `make git-log` - View recent commit history
- `make git-branches` - Show all branches
- `make git-clean` - Clean working directory (removes untracked files)
- `make git-reset` - Reset to HEAD (discard unstaged changes)
- `make git-sync` - Sync with remote repository
- `make git-backup` - Create backup branch of current work
- `make git-changelog` - Generate changelog from git commits

### Netlify Commands
- `make netlify-dev` - Start Netlify development environment (functions + frontend)
- `make netlify-functions` - Start local function development server only
- `make netlify-build` - Build project specifically for Netlify deployment
- `make netlify-status` - Show Netlify site status (requires netlify-cli)
- `make netlify-deploy` - Deploy to Netlify (production)
- `make netlify-preview` - Deploy preview to Netlify
- `make netlify-logs` - View Netlify function logs
- `make netlify-env` - Show/manage Netlify environment variables
- `make netlify-test-functions` - Test Netlify functions locally
- `make netlify-validate` - Validate Netlify configuration
- `make netlify-setup` - Setup Netlify CLI and authenticate
- `make netlify-clean` - Clean Netlify cache and temp files

### Deployment Commands
- `make deploy` - Build and prepare for deployment
- `make deploy-preview` - Test deployment locally

### Documentation Commands
- `make docs-version` - View version management documentation
- `make docs-test` - View testing documentation
- `make docs-main` - View main project documentation

### Maintenance Commands
- `make clean` - Clean build artifacts and node_modules
- `make clean-install` - Clean everything and reinstall dependencies
- `make update-deps` - Update all dependencies to latest versions
- `make audit` - Run security audit on dependencies
- `make audit-fix` - Automatically fix security vulnerabilities
- `make check-updates` - Check for outdated dependencies

### Project Information Commands
- `make info` - Show project information
- `make size` - Show build size information
- `make analyze-bundle` - Analyze bundle size (requires build)

### Emergency Commands
- `make emergency-backup` - Create emergency backup of entire project

### Core Development (Fallback Commands)
- `npm run dev` - Start Vite development server on port 5180
- `npm run dev:functions` - Start local function development server using dev-server.js
- `npm run dev:netlify` - Start Netlify development environment on port 8890
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint on the codebase (ALWAYS run after code changes)
- `npm run preview` - Preview production build locally

## Architecture

### Frontend Stack
- **React 18** with TypeScript for the main application
- **Vite** for development server and build tooling
- **React Router** for client-side routing
- **TailwindCSS** for styling with custom Sunshine-AIO branding colors
- **i18next** for internationalization with 9 supported languages (en, fr, de, es, it, ja, ko, pt, ru, zh)

### Deployment
- **Netlify** hosting with serverless functions
- **Node.js 18** runtime environment
- Functions deployed to `netlify/functions/` directory

### Key Components Structure
- `src/App.tsx` - Main application with React Router setup
- `src/components/` - Reusable UI components including Header, Footer, Hero, ChatAssistant
- `src/pages/` - Route-specific page components (Home, Tools, Guide, About, Contact)
- `src/hooks/` - Custom React hooks (useTheme for dark/light mode)
- `src/i18n.ts` - Internationalization configuration

### AI Chat Assistant
The ChatAssistant component integrates with a Netlify function (`netlify/functions/chat.js`) that:
- Uses Google Generative AI (Gemini) for responses
- Includes a built-in knowledge base for common Sunshine-AIO questions
- Supports both French and English interactions
- Requires `GEMINI_API_KEY` environment variable

### Internationalization
- Translation files located in `public/locales/{lang}/translation.json`
- Automatic language detection with localStorage persistence
- Fallback language: English

### Custom Theming
The application uses custom TailwindCSS colors for the Sunshine-AIO brand:
- `sunshine-violet` and `sunshine-blue` for gradients and primary elements
- Dark/light mode support throughout the application

### PowerShell Integration
- Main installation script: `public/script.ps1`
- Test infrastructure in `tests/` directory with comprehensive testing guides
- Supports automatic updates and dependency management

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

## Development Notes

### File Structure Patterns
- Components use TypeScript with React functional components
- Consistent use of React hooks for state management
- All styling done through TailwindCSS classes
- Icons from Lucide React and FontAwesome

### Environment Requirements
- Node.js 18+
- For AI features: GEMINI_API_KEY environment variable
- For Netlify deployment: appropriate build and function configurations

### Testing
- Test infrastructure located in `tests/` directory
- Comprehensive test guide available in `tests/TEST-GUIDE.md`
- PowerShell test scripts for installation process validation

### Netlify Configuration
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Development port: 5180 (proxied through 8890 for Netlify dev)

## Development Workflow

1. **Setup**: `make setup` (installs deps, builds, shows info)
2. **Development**: `make dev` for hot reload development (optionally specify port: `make dev 8080`)
3. **Before commits**: `make lint && make typecheck` must pass
4. **Testing**: `make test` to run PowerShell simulations
5. **Releases**: Use `make release-*` commands for automated releases

### Before Making Changes
1. Run `make lint` or `npm run lint` to ensure code quality
2. Test locally with `make dev` or `npm run dev:netlify` for function testing

### TypeScript Compilation
- The project uses TypeScript with strict type checking
- Build process runs `tsc && vite build` - both must pass for successful deployment

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
- Use `make test-custom REPO=your-repo` to test with custom repository
- PowerShell tests simulate the installation process without real changes
- Logs are saved to `%TEMP%\sunshine-aio-install-test.log`

## Deployment
- Production builds via `make build`
- Deployed automatically to Netlify on main branch pushes
- Use `make deploy-preview` to test deployment locally
- Use `make netlify-deploy` for direct production deployment
- Use `make netlify-preview` for preview deployments
- Use `make netlify-validate` to check configuration

## Emergency Procedures
- `make emergency-backup` - Create full project backup
- `make clean-install` - Clean rebuild from scratch
- `make git-clean` - Clean working directory
- `make git-reset` - Reset to HEAD (discard unstaged changes)
- `make netlify-clean` - Clean Netlify cache and temp files

## Remember
- **Use `make` commands instead of raw npm/git commands**
- **Always run `make lint` and `make typecheck` before commits**
- **Use automated release process with `make release-*`**
- **Test PowerShell scripts with `make test` before releases**
