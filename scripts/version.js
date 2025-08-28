#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

class VersionManager {
    constructor() {
        this.rootDir = process.cwd();
        this.packageJsonPath = join(this.rootDir, 'package.json');
        this.versionFilePath = join(this.rootDir, 'version.txt');
        this.changelogPath = join(this.rootDir, 'CHANGELOG.md');
        this.scriptPath = join(this.rootDir, 'public', 'script.ps1');
        this.testScriptPath = join(this.rootDir, 'tests', 'test-script.ps1');
    }

    getCurrentVersion() {
        if (existsSync(this.packageJsonPath)) {
            const packageJson = JSON.parse(readFileSync(this.packageJsonPath, 'utf8'));
            return packageJson.version;
        }
        if (existsSync(this.versionFilePath)) {
            return readFileSync(this.versionFilePath, 'utf8').trim();
        }
        return '1.0.4';
    }

    parseVersion(version) {
        const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
        if (!match) {
            throw new Error(`Invalid version format: ${version}`);
        }
        return {
            major: parseInt(match[1]),
            minor: parseInt(match[2]),
            patch: parseInt(match[3]),
            prerelease: match[4] || null
        };
    }

    formatVersion(versionObj) {
        let version = `${versionObj.major}.${versionObj.minor}.${versionObj.patch}`;
        if (versionObj.prerelease) {
            version += `-${versionObj.prerelease}`;
        }
        return version;
    }

    bumpVersion(type, prerelease = null) {
        const currentVersion = this.getCurrentVersion();
        const parsed = this.parseVersion(currentVersion);
        
        switch (type) {
            case 'major':
                parsed.major++;
                parsed.minor = 0;
                parsed.patch = 0;
                parsed.prerelease = null;
                break;
            case 'minor':
                parsed.minor++;
                parsed.patch = 0;
                parsed.prerelease = null;
                break;
            case 'patch':
                parsed.patch++;
                parsed.prerelease = null;
                break;
            case 'prerelease':
                if (parsed.prerelease) {
                    // Increment prerelease number
                    const match = parsed.prerelease.match(/^(.+?)\.?(\d+)?$/);
                    const prefix = match[1];
                    const number = match[2] ? parseInt(match[2]) + 1 : 1;
                    parsed.prerelease = `${prefix}.${number}`;
                } else {
                    parsed.patch++;
                    parsed.prerelease = prerelease || 'alpha.1';
                }
                break;
            default:
                throw new Error(`Invalid bump type: ${type}`);
        }

        return this.formatVersion(parsed);
    }

    updatePackageJson(version) {
        if (existsSync(this.packageJsonPath)) {
            const packageJson = JSON.parse(readFileSync(this.packageJsonPath, 'utf8'));
            packageJson.version = version;
            writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
            console.log(`✓ Updated package.json to version ${version}`);
        }
    }

    updateVersionFile(version) {
        writeFileSync(this.versionFilePath, version + '\n');
        console.log(`✓ Updated version.txt to version ${version}`);
    }

    updatePowerShellScripts(version) {
        // Update main script
        if (existsSync(this.scriptPath)) {
            let content = readFileSync(this.scriptPath, 'utf8');
            content = content.replace(/# Version: .+/, `# Version: ${version}`);
            content = content.replace(/\$script:ScriptVersion = ".+"/, `$script:ScriptVersion = "${version}"`);
            writeFileSync(this.scriptPath, content);
            console.log(`✓ Updated PowerShell script to version ${version}`);
        }

        // Update test script
        if (existsSync(this.testScriptPath)) {
            let content = readFileSync(this.testScriptPath, 'utf8');
            content = content.replace(/# Version: .+/, `# Version: ${version}-test`);
            content = content.replace(/\$script:ScriptVersion = ".+"/, `$script:ScriptVersion = "${version}-test"`);
            writeFileSync(this.testScriptPath, content);
            console.log(`✓ Updated test script to version ${version}-test`);
        }
    }

    initializeChangelog() {
        if (!existsSync(this.changelogPath)) {
            const initialContent = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

`;
            writeFileSync(this.changelogPath, initialContent);
            console.log(`✓ Created CHANGELOG.md`);
        }
    }

    addChangelogEntry(version, changes) {
        if (!existsSync(this.changelogPath)) {
            this.initializeChangelog();
        }

        const content = readFileSync(this.changelogPath, 'utf8');
        const date = new Date().toISOString().split('T')[0];
        
        const versionEntry = `## [${version}] - ${date}

${changes}

`;

        // Insert after the "## [Unreleased]" section
        const unreleasedIndex = content.indexOf('## [Unreleased]');
        if (unreleasedIndex !== -1) {
            const nextSectionIndex = content.indexOf('\n## [', unreleasedIndex + 1);
            const insertIndex = nextSectionIndex !== -1 ? nextSectionIndex : content.length;
            
            const newContent = content.slice(0, insertIndex) + '\n' + versionEntry + content.slice(insertIndex);
            writeFileSync(this.changelogPath, newContent);
            console.log(`✓ Added changelog entry for version ${version}`);
        } else {
            console.warn('⚠ Could not find "Unreleased" section in CHANGELOG.md');
        }
    }

    release(type, message, prerelease) {
        const newVersion = this.bumpVersion(type, prerelease);
        
        console.log(`🚀 Releasing version ${newVersion}...`);
        
        // Update all version files
        this.updatePackageJson(newVersion);
        this.updateVersionFile(newVersion);
        this.updatePowerShellScripts(newVersion);
        
        // Update changelog
        if (message) {
            this.addChangelogEntry(newVersion, message);
        }
        
        console.log(`✅ Version ${newVersion} released successfully!`);
        return newVersion;
    }

    showCurrentVersion() {
        const version = this.getCurrentVersion();
        console.log(version);
        return version;
    }
}

// CLI interface
function main() {
    const args = process.argv.slice(2);
    const vm = new VersionManager();

    if (args.length === 0) {
        console.log('Usage: node version.js <command> [options]');
        console.log('Commands:');
        console.log('  current                    Show current version');
        console.log('  bump <type> [message]      Bump version (major|minor|patch|prerelease)');
        console.log('  init                       Initialize changelog');
        console.log('  changelog <version> <msg>  Add changelog entry');
        process.exit(1);
    }

    const command = args[0];

    try {
        switch (command) {
            case 'current':
                vm.showCurrentVersion();
                break;
            
            case 'bump':
                if (args.length < 2) {
                    console.error('Usage: bump <type> [message] [prerelease]');
                    process.exit(1);
                }
                const type = args[1];
                const message = args[2] || '';
                const prerelease = args[3];
                vm.release(type, message, prerelease);
                break;
            
            case 'init':
                vm.initializeChangelog();
                break;
            
            case 'changelog':
                if (args.length < 3) {
                    console.error('Usage: changelog <version> <message>');
                    process.exit(1);
                }
                vm.addChangelogEntry(args[1], args[2]);
                break;
            
            default:
                console.error(`Unknown command: ${command}`);
                process.exit(1);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default VersionManager;