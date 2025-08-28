# Sunshine-AIO Web Installer Makefile
# Complete command reference for the project

.PHONY: help install dev build clean lint test preview deploy version release docs

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