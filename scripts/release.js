#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import VersionManager from './version.js';

class ReleaseManager {
    constructor() {
        this.vm = new VersionManager();
    }

    async runCommand(command, description) {
        console.log(`📋 ${description}...`);
        try {
            const output = execSync(command, { 
                encoding: 'utf8',
                cwd: process.cwd()
            });
            if (output.trim()) {
                console.log(`   ${output.trim()}`);
            }
            return output;
        } catch (error) {
            console.error(`❌ Failed: ${error.message}`);
            process.exit(1);
        }
    }

    async checkGitStatus() {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        if (status.trim()) {
            console.log('⚠️  Working directory has uncommitted changes:');
            console.log(status);
            const readline = await import('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            return new Promise((resolve) => {
                rl.question('Continue with release? (y/N): ', (answer) => {
                    rl.close();
                    if (answer.toLowerCase() !== 'y') {
                        console.log('Release cancelled.');
                        process.exit(0);
                    }
                    resolve();
                });
            });
        }
    }

    async performRelease(type, message, skipTests = false) {
        console.log(`🚀 Starting ${type} release...`);
        
        // Check git status
        await this.checkGitStatus();
        
        // Run tests if not skipped
        if (!skipTests) {
            try {
                await this.runCommand('npm test', 'Running tests');
            } catch (error) {
                console.log('⚠️  No test script found, skipping tests');
            }
        }
        
        // Run linting
        try {
            await this.runCommand('npm run lint', 'Running linter');
        } catch (error) {
            console.log('⚠️  Lint script failed, continuing...');
        }
        
        // Build project
        try {
            await this.runCommand('npm run build', 'Building project');
        } catch (error) {
            console.log('⚠️  Build script failed, continuing...');
        }
        
        // Get current version before bump
        const oldVersion = this.vm.getCurrentVersion();
        
        // Bump version and update files
        const newVersion = this.vm.release(type, message);
        
        // Stage version files
        await this.runCommand('git add package.json version.txt public/script.ps1 tests/test-script.ps1 CHANGELOG.md', 'Staging version files');
        
        // Commit changes
        const commitMessage = `chore: release v${newVersion}${message ? '\n\n' + message : ''}`;
        await this.runCommand(`git commit -m "${commitMessage}"`, 'Committing version bump');
        
        // Create git tag
        await this.runCommand(`git tag -a v${newVersion} -m "Release v${newVersion}"`, 'Creating git tag');
        
        console.log(`✅ Release v${newVersion} completed successfully!`);
        console.log(`📝 Changelog updated`);
        console.log(`🏷️  Git tag v${newVersion} created`);
        console.log(`\n🎉 To push the release:`);
        console.log(`   git push origin feature/versioning-system --tags`);
        
        return newVersion;
    }

    async hotfix(message) {
        return this.performRelease('patch', `Hotfix: ${message}`);
    }

    async patch(message) {
        return this.performRelease('patch', message);
    }

    async minor(message) {
        return this.performRelease('minor', message);
    }

    async major(message) {
        return this.performRelease('major', message);
    }

    async prerelease(message, prereleaseType = 'alpha') {
        return this.performRelease('prerelease', message, false, prereleaseType);
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const rm = new ReleaseManager();

    if (args.length === 0) {
        console.log('Usage: node release.js <command> [message]');
        console.log('Commands:');
        console.log('  major [message]        Release major version (breaking changes)');
        console.log('  minor [message]        Release minor version (new features)');
        console.log('  patch [message]        Release patch version (bug fixes)');
        console.log('  hotfix <message>       Release hotfix (urgent patch)');
        console.log('  prerelease [message]   Release prerelease version');
        process.exit(1);
    }

    const command = args[0];
    const message = args.slice(1).join(' ');

    try {
        switch (command) {
            case 'major':
                await rm.major(message);
                break;
            case 'minor':
                await rm.minor(message);
                break;
            case 'patch':
                await rm.patch(message);
                break;
            case 'hotfix':
                if (!message) {
                    console.error('Hotfix requires a message');
                    process.exit(1);
                }
                await rm.hotfix(message);
                break;
            case 'prerelease':
                await rm.prerelease(message);
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

export default ReleaseManager;