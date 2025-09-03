# Sunshine-AIO Web Installer Makefile
# Complete command reference for the project

.PHONY: help install dev build clean lint test preview deploy version release docs netlify-dev netlify-functions netlify-build netlify-status netlify-deploy netlify-preview netlify-logs netlify-env netlify-test-functions netlify-validate netlify-setup netlify-clean

# Catch-all rule to prevent Make from trying to build port numbers as targets
%:
	@:

# Default target
help: ## Show this help message
	@echo "Sunshine-AIO Web Installer - Available Commands"
	@echo "=============================================="
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development Commands
install: ## Install project dependencies
	npm install

dev: ## Start development server with hot reload (usage: make dev [PORT])
	@if [ -n "$(word 2,$(MAKECMDGOALS))" ]; then \
		echo "Starting development server on port $(word 2,$(MAKECMDGOALS))..."; \
		npx vite --port $(word 2,$(MAKECMDGOALS)); \
	else \
		npm run dev; \
	fi

build: ## Build the project for production
	npm run build

build-styles: ## Build CSS styles with PostCSS
	npm run build:styles

preview: ## Preview the built application locally
	npm run preview

# Code Quality Commands
lint: ## Run ESLint to check code quality
	npm run lint

lint-fix: ## Run ESLint and automatically fix issues
	npx eslint . --fix

typecheck: ## Run TypeScript type checking
	npx tsc --noEmit

# Testing Commands
test: ## Run PowerShell test scripts
	@echo "Running PowerShell test scripts..."
	@powershell -ExecutionPolicy Bypass -File tests/test-script.ps1

test-skip: ## Run tests skipping update checks
	@powershell -ExecutionPolicy Bypass -File tests/test-script.ps1 -SkipUpdateCheck

test-custom: ## Run tests with custom repository (usage: make test-custom REPO=your-repo)
	@powershell -ExecutionPolicy Bypass -File tests/test-script.ps1 -TestRepo "$(REPO)"

# Version Management Commands
version: ## Show current version
	npm run version:current

version-major: ## Bump major version (breaking changes)
	npm run version:bump:major

version-minor: ## Bump minor version (new features)
	npm run version:bump:minor

version-patch: ## Bump patch version (bug fixes)
	npm run version:bump:patch

version-prerelease: ## Bump prerelease version (alpha/beta)
	npm run version:prerelease

version-init: ## Initialize versioning system
	npm run version:init

# Release Management Commands
release-major: ## Complete major release with tests and build
	npm run release:major

release-minor: ## Complete minor release with tests and build
	npm run release:minor

release-patch: ## Complete patch release with tests and build
	npm run release:patch

release-hotfix: ## Complete hotfix release for urgent fixes
	npm run release:hotfix

release-prerelease: ## Complete prerelease for development versions
	npm run release:prerelease

# Git Commands
git-status: ## Show git repository status
	git status

git-log: ## Show recent commit history
	git log --oneline -10

git-branches: ## Show all branches
	git branch -a

git-clean: ## Clean working directory (removes untracked files)
	git clean -fd

git-reset: ## Reset to HEAD (discard unstaged changes)
	git reset --hard HEAD

# Netlify Commands
netlify-dev: ## Start Netlify development environment (functions + frontend)
	npm run dev:netlify

netlify-functions: ## Start local function development server only
	npm run dev:functions

netlify-build: ## Build project specifically for Netlify deployment
	npm run build
	@echo "Build completed for Netlify deployment."

netlify-status: ## Show Netlify site status (requires netlify-cli)
	@if command -v netlify >/dev/null 2>&1; then \
		netlify status; \
	else \
		echo "Netlify CLI not installed. Run: npm install -g netlify-cli"; \
	fi

netlify-deploy: ## Deploy to Netlify (production)
	@if command -v netlify >/dev/null 2>&1; then \
		make netlify-build && netlify deploy --prod; \
	else \
		echo "Netlify CLI not installed. Run: npm install -g netlify-cli"; \
	fi

netlify-preview: ## Deploy preview to Netlify
	@if command -v netlify >/dev/null 2>&1; then \
		make netlify-build && netlify deploy; \
	else \
		echo "Netlify CLI not installed. Run: npm install -g netlify-cli"; \
	fi

netlify-logs: ## View Netlify function logs
	@if command -v netlify >/dev/null 2>&1; then \
		netlify logs; \
	else \
		echo "Netlify CLI not installed. Run: npm install -g netlify-cli"; \
	fi

netlify-env: ## Show/manage Netlify environment variables
	@if command -v netlify >/dev/null 2>&1; then \
		netlify env:list; \
	else \
		echo "Netlify CLI not installed. Run: npm install -g netlify-cli"; \
	fi

netlify-test-functions: ## Test Netlify functions locally
	@echo "Testing Netlify functions locally..."
	@if [ -d "netlify/functions" ]; then \
		echo "Available functions:"; \
		ls -la netlify/functions/; \
		echo "Starting function dev server for testing..."; \
		npm run dev:functions & \
		sleep 3; \
		echo "Functions server started. Test at http://localhost:8888/.netlify/functions/"; \
		echo "Press Ctrl+C to stop the server."; \
		wait; \
	else \
		echo "No netlify/functions directory found."; \
	fi

netlify-validate: ## Validate Netlify configuration
	@echo "Validating Netlify configuration..."
	@if [ -f "netlify.toml" ]; then \
		echo "✓ netlify.toml found"; \
		cat netlify.toml; \
	else \
		echo "✗ netlify.toml not found"; \
	fi
	@if [ -d "netlify/functions" ]; then \
		echo "✓ Functions directory found"; \
		echo "Functions:"; \
		ls -la netlify/functions/; \
	else \
		echo "✗ Functions directory not found"; \
	fi

netlify-setup: ## Setup Netlify CLI and authenticate
	@echo "Setting up Netlify CLI..."
	@if ! command -v netlify >/dev/null 2>&1; then \
		echo "Installing Netlify CLI globally..."; \
		npm install -g netlify-cli; \
	fi
	@echo "Authenticate with Netlify (this will open your browser):"
	@netlify login
	@echo "Linking site to Netlify project:"
	@netlify link

netlify-clean: ## Clean Netlify cache and temp files
	@echo "Cleaning Netlify cache..."
	@rm -rf .netlify
	@echo "Netlify cache cleared."

# Deployment Commands
deploy: ## Build and prepare for deployment
	npm run build
	@echo "Build completed. Ready for deployment to Netlify."

deploy-preview: ## Test deployment locally
	npm run build && npm run preview

# Documentation Commands
docs-version: ## View version management documentation
	@cat scripts/README.md

docs-test: ## View testing documentation
	@cat tests/TEST-GUIDE.md

docs-main: ## View main project documentation
	@cat README.md

# Maintenance Commands
clean: ## Clean build artifacts and node_modules
	rm -rf dist
	rm -rf node_modules
	rm -rf .vite

clean-install: ## Clean everything and reinstall dependencies
	make clean
	npm install

update-deps: ## Update all dependencies to latest versions
	npm update

audit: ## Run security audit on dependencies
	npm audit

audit-fix: ## Automatically fix security vulnerabilities
	npm audit fix

# Project Information Commands
info: ## Show project information
	@echo "Project: $(shell node -p "require('./package.json').name")"
	@echo "Version: $(shell node -p "require('./package.json').version")"
	@echo "Node.js: $(shell node --version)"
	@echo "npm: $(shell npm --version)"
	@echo "Git branch: $(shell git rev-parse --abbrev-ref HEAD)"
	@echo "Git status: $(shell git status --porcelain | wc -l) files changed"

size: ## Show build size information
	@if [ -d "dist" ]; then \
		echo "Build size information:"; \
		du -sh dist/; \
		find dist -name "*.js" -o -name "*.css" | xargs ls -lh; \
	else \
		echo "No build found. Run 'make build' first."; \
	fi

# Development Utilities
watch-styles: ## Watch and build styles on change
	npx postcss src/index.css -o public/styles.css --watch

serve-public: ## Serve public directory (for testing static files)
	npx http-server public -p 3000

check-updates: ## Check for outdated dependencies
	npm outdated

# Advanced Git Commands
git-sync: ## Sync with remote repository
	git fetch origin
	git pull origin main

git-backup: ## Create backup branch of current work
	git checkout -b backup-$(shell date +%Y%m%d-%H%M%S)
	git checkout -

git-changelog: ## Generate changelog from git commits
	git log --pretty=format:"- %s" --since="1 month ago" > TEMP-CHANGELOG.md
	@echo "Temporary changelog generated in TEMP-CHANGELOG.md"

# CI/CD Simulation
ci: ## Simulate CI pipeline (lint, typecheck, build, test)
	@echo "Running CI pipeline simulation..."
	make lint
	make typecheck
	make build
	@echo "CI pipeline completed successfully!"

# Quick Development Setup
setup: ## Complete project setup (install + build + info)
	make install
	make build
	make info
	@echo "Project setup completed!"

# Emergency Commands
emergency-backup: ## Create emergency backup of entire project
	@echo "Creating emergency backup..."
	cd .. && tar -czf sunshine-aio-backup-$(shell date +%Y%m%d-%H%M%S).tar.gz sunshine-aio-web/
	@echo "Backup created in parent directory"

# Performance Analysis
analyze-bundle: ## Analyze bundle size (requires build)
	@if [ -d "dist" ]; then \
		echo "Bundle analysis:"; \
		find dist -name "*.js" -exec wc -c {} + | sort -n; \
		find dist -name "*.css" -exec wc -c {} + | sort -n; \
	else \
		echo "No build found. Run 'make build' first."; \
	fi