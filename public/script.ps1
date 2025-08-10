# Sunshine-AIO Installation Script
# Enhanced with better error handling, UI improvements, and robust Python detection
# Added automatic update checking functionality
# Version: 1.0.3

param(
    [string]$InstallPath = "",
    [switch]$SkipUpdateCheck = $false
)

# Script version - hardcoded for easy maintenance
$script:ScriptVersion = "1.0.3"

# Set strict mode for better error detection
Set-StrictMode -Version Latest

# Initialize global variables
$script:LogFile = Join-Path $env:TEMP "sunshine_aio_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$script:ProgressActivity = "Installing Sunshine-AIO"
$script:ScriptUrl = "https://sunshine-aio.com/script.ps1"
$script:AllowGitUpdates = $true  # Controls whether git pull operations are allowed

# Utility Functions
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Add-Content -Path $script:LogFile -Value $logEntry -ErrorAction SilentlyContinue
    
    switch ($Level) {
        "ERROR" { Write-Host "[ERROR] $Message" -ForegroundColor Red }
        "WARN"  { Write-Host "[WARN]  $Message" -ForegroundColor Yellow }
        "SUCCESS" { Write-Host "[OK]    $Message" -ForegroundColor Green }
        default { Write-Host "[INFO]  $Message" -ForegroundColor Cyan }
    }
}

function Show-Progress {
    param([string]$Status, [int]$PercentComplete = 0)
    Write-Progress -Activity $script:ProgressActivity -Status $Status -PercentComplete $PercentComplete
}

function Move-LogToInstallDirectory {
    param([string]$InstallPath)
    
    try {
        $logsDir = Join-Path $InstallPath "logs"
        if (-not (Test-Path $logsDir)) {
            New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
        }
        
        $finalLogPath = Join-Path $logsDir (Split-Path $script:LogFile -Leaf)
        if (Test-Path $script:LogFile) {
            Copy-Item $script:LogFile $finalLogPath -Force
            Remove-Item $script:LogFile -Force -ErrorAction SilentlyContinue
            $script:LogFile = $finalLogPath
            Write-Log "Log file moved to installation directory: $finalLogPath" "SUCCESS"
        }
    } catch {
        Write-Log "Warning: Could not move log file to installation directory: $_" "WARN"
    }
}

function Test-InternetConnection {
    try {
        $null = Test-NetConnection -ComputerName "8.8.8.8" -Port 53 -InformationLevel Quiet -WarningAction SilentlyContinue
        return $true
    } catch {
        return $false
    }
}

function Get-CurrentVersion {
    try {
        if (Test-Path ".git") {
            # Get the latest tag reachable from current HEAD (where the user currently is)
            $latestTag = git describe --tags --abbrev=0 HEAD 2>$null
            if ($LASTEXITCODE -eq 0 -and $latestTag) {
                return $latestTag.Trim()
            }
            
            # If no tags found, return "no-tag"
            return "no-tag"
        }
        return "unknown"
    } catch {
        Write-Log "Error getting current version: $_" "WARN"
        return "unknown"
    }
}

function Get-RemoteVersion {
    try {
        git fetch origin --tags --quiet 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            # Get the latest tag from all remote tags, sorted by version
            $latestTag = git tag -l --sort=-version:refname | Select-Object -First 1
            if ($latestTag) {
                return $latestTag.Trim()
            }
        }
        return "unknown"
    } catch {
        Write-Log "Error getting remote version: $_" "WARN"
        return "unknown"
    }
}

function Get-RemoteCommit {
    try {
        $remoteCommit = git rev-parse origin/main 2>$null
        if ($LASTEXITCODE -eq 0 -and $remoteCommit) {
            return $remoteCommit.Trim()
        }
        return "unknown"
    } catch {
        return "unknown"
    }
}

function Get-LastPublishedTag {
    try {
        # Get the latest tag that exists locally (before any unpushed commits)
        $localTag = git describe --tags --abbrev=0 HEAD 2>$null
        if ($LASTEXITCODE -eq 0 -and $localTag) {
            # Get the commit hash of this tag
            $tagCommit = git rev-list -n 1 $localTag 2>$null
            if ($LASTEXITCODE -eq 0 -and $tagCommit) {
                return $tagCommit.Trim()
            }
        }
        return "unknown"
    } catch {
        return "unknown"
    }
}

function Get-CurrentCommit {
    try {
        $commit = git rev-parse HEAD 2>$null
        if ($LASTEXITCODE -eq 0 -and $commit) {
            return $commit.Trim()
        }
        return "unknown"
    } catch {
        return "unknown"
    }
}

function Get-LatestCommitInfo {
    param([string]$Commit)
    
    try {
        $message = git log -1 --pretty=format:"%s" $Commit 2>$null
        $date = git log -1 --pretty=format:"%ci" $Commit 2>$null
        
        if ($LASTEXITCODE -eq 0 -and $message -and $date) {
            return @{
                Message = $message.Trim()
                Date = [DateTime]::Parse($date).ToString("MM/dd/yyyy HH:mm")
            }
        }
        return @{
            Message = "No details available"
            Date = "Unknown date"
        }
    } catch {
        return @{
            Message = "Error retrieving commit info"
            Date = "Unknown date"
        }
    }
}


function Get-CommitsSummary {
    param([string]$FromCommit, [string]$ToCommit)
    
    try {
        # Get the latest 3 commits with their messages
        $commits = git log --oneline --max-count=3 "$FromCommit..$ToCommit" 2>$null
        if ($LASTEXITCODE -eq 0 -and $commits) {
            # $commits is already an array, no need to split
            $summary = @()
            
            foreach ($line in $commits) {
                if ($line -match "^([a-f0-9]{7,}) (.+)$") {
                    $commitHash = $matches[1]
                    $commitMsg = $matches[2].Trim()
                    
                    # Check if commit message contains a version tag
                    $versionPrefix = ""
                    if ($commitMsg -match "v?\d+\.\d+\.\d+") {
                        $versionMatch = $matches[0]
                        $versionPrefix = "[$versionMatch] "
                        # Remove version from commit message to avoid duplication
                        $commitMsg = $commitMsg -replace "v?\d+\.\d+\.\d+[^\w]*", ""
                        $commitMsg = $commitMsg.Trim()
                    }
                    
                    # Truncate very long commit messages
                    if ($commitMsg.Length -gt 70) {
                        $commitMsg = $commitMsg.Substring(0, 67) + "..."
                    }
                    
                    $summary += "$versionPrefix$commitMsg"
                }
            }
            
            if ($summary.Count -gt 0) {
                return $summary -join "`n"
            }
        }
        return "Latest updates and improvements"
    } catch {
        return "Error retrieving update details"
    }
}

function Show-UpdateDialog {
    param(
        [string]$CurrentVersion,
        [string]$RemoteVersion,
        [string]$Summary,
        [string]$ChangelogUrl
    )
    
    # Create a custom form with clickable link
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "Update Available - Sunshine-AIO"
    $form.StartPosition = "CenterScreen"
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false
    $form.MinimizeBox = $false
    $form.Icon = [System.Drawing.SystemIcons]::Information
    $form.BackColor = [System.Drawing.Color]::White
    $form.AutoSize = $true
    $form.AutoSizeMode = [System.Windows.Forms.AutoSizeMode]::GrowAndShrink
    
    # Title label
    $titleLabel = New-Object System.Windows.Forms.Label
    $titleLabel.Text = "Update Available"
    $titleLabel.Location = New-Object System.Drawing.Point(30, 20)
    $titleLabel.Size = New-Object System.Drawing.Size(520, 35)
    $titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $titleLabel.ForeColor = [System.Drawing.Color]::FromArgb(0, 102, 204)
    
    # Subtitle
    $subtitleLabel = New-Object System.Windows.Forms.Label
    $subtitleLabel.Text = "A new version of Sunshine-AIO is available!"
    $subtitleLabel.Location = New-Object System.Drawing.Point(30, 65)
    $subtitleLabel.Size = New-Object System.Drawing.Size(520, 25)
    $subtitleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 11)
    $subtitleLabel.ForeColor = [System.Drawing.Color]::FromArgb(64, 64, 64)
    
    # Version info section
    $versionPanel = New-Object System.Windows.Forms.Panel
    $versionPanel.Location = New-Object System.Drawing.Point(30, 110)
    $versionPanel.Size = New-Object System.Drawing.Size(520, 80)
    $versionPanel.BackColor = [System.Drawing.Color]::FromArgb(248, 249, 250)
    $versionPanel.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
    
    $currentVersionLabel = New-Object System.Windows.Forms.Label
    $currentVersionLabel.Text = "Current version:"
    $currentVersionLabel.Location = New-Object System.Drawing.Point(15, 15)
    $currentVersionLabel.Size = New-Object System.Drawing.Size(120, 20)
    $currentVersionLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $currentVersionLabel.ForeColor = [System.Drawing.Color]::FromArgb(64, 64, 64)
    
    $currentVersionValue = New-Object System.Windows.Forms.Label
    $currentVersionValue.Text = $CurrentVersion
    $currentVersionValue.Location = New-Object System.Drawing.Point(140, 15)
    $currentVersionValue.Size = New-Object System.Drawing.Size(150, 20)
    $currentVersionValue.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
    $currentVersionValue.ForeColor = [System.Drawing.Color]::FromArgb(108, 117, 125)
    
    $newVersionLabel = New-Object System.Windows.Forms.Label
    $newVersionLabel.Text = "New version:"
    $newVersionLabel.Location = New-Object System.Drawing.Point(15, 45)
    $newVersionLabel.Size = New-Object System.Drawing.Size(120, 20)
    $newVersionLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $newVersionLabel.ForeColor = [System.Drawing.Color]::FromArgb(64, 64, 64)
    
    $newVersionValue = New-Object System.Windows.Forms.Label
    $newVersionValue.Text = $RemoteVersion
    $newVersionValue.Location = New-Object System.Drawing.Point(140, 45)
    $newVersionValue.Size = New-Object System.Drawing.Size(150, 20)
    $newVersionValue.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
    $newVersionValue.ForeColor = [System.Drawing.Color]::FromArgb(40, 167, 69)
    
    $versionPanel.Controls.Add($currentVersionLabel)
    $versionPanel.Controls.Add($currentVersionValue)
    $versionPanel.Controls.Add($newVersionLabel)
    $versionPanel.Controls.Add($newVersionValue)
    
    # Updates section title
    $updatesTitle = New-Object System.Windows.Forms.Label
    $updatesTitle.Text = "Key Updates:"
    $updatesTitle.Location = New-Object System.Drawing.Point(30, 210)
    $updatesTitle.Size = New-Object System.Drawing.Size(520, 25)
    $updatesTitle.Font = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
    $updatesTitle.ForeColor = [System.Drawing.Color]::FromArgb(73, 80, 87)
    
    # Updates content as bulleted list
    $updatesListBox = New-Object System.Windows.Forms.ListBox
    $summaryLines = $Summary -split "`n" | Where-Object { $_.Trim() -ne "" }
    foreach ($line in $summaryLines) {
        $cleanLine = $line.Trim()
        if ($cleanLine -ne "") {
            # Simply add each commit with a bullet point - one line per commit
            $null = $updatesListBox.Items.Add("- $cleanLine")
        }
    }
    
    # Calculate dynamic height based on items
    $itemCount = $updatesListBox.Items.Count
    $itemHeight = 16  # Approximate height per item
    $minHeight = 80
    $maxHeight = 160
    $calculatedHeight = [Math]::Max($minHeight, [Math]::Min($maxHeight, $itemCount * $itemHeight + 20))
    
    $updatesListBox.Location = New-Object System.Drawing.Point(30, 245)
    $updatesListBox.Size = New-Object System.Drawing.Size(520, $calculatedHeight)
    $updatesListBox.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $updatesListBox.BackColor = [System.Drawing.Color]::FromArgb(248, 249, 250)
    $updatesListBox.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
    $updatesListBox.SelectionMode = [System.Windows.Forms.SelectionMode]::None
    $updatesListBox.ForeColor = [System.Drawing.Color]::FromArgb(73, 80, 87)
    
    # Calculate dynamic positions based on listbox height
    $linkY = 245 + $calculatedHeight + 20
    $questionY = $linkY + 35
    $buttonY = $questionY + 35
    
    # Clickable link
    $linkLabel = New-Object System.Windows.Forms.LinkLabel
    $linkLabel.Text = "View full changelog on GitHub"
    $linkLabel.Location = New-Object System.Drawing.Point(30, $linkY)
    $linkLabel.Size = New-Object System.Drawing.Size(300, 25)
    $linkLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $linkLabel.LinkColor = [System.Drawing.Color]::FromArgb(0, 102, 204)
    $linkLabel.ActiveLinkColor = [System.Drawing.Color]::FromArgb(0, 82, 164)
    $linkLabel.VisitedLinkColor = [System.Drawing.Color]::FromArgb(108, 117, 125)
    $linkLabel.Tag = $ChangelogUrl
    $linkLabel.Add_LinkClicked({
        param($sender, $e)
        try {
            Start-Process $sender.Tag
        } catch {
            # Fallback if Start-Process fails
            [System.Windows.Forms.Clipboard]::SetText($sender.Tag)
            [System.Windows.Forms.MessageBox]::Show("Changelog URL copied to clipboard: $($sender.Tag)", "Information", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
        }
    })
    
    # Question label
    $questionLabel = New-Object System.Windows.Forms.Label
    $questionLabel.Text = "Would you like to install the update now?"
    $questionLabel.Location = New-Object System.Drawing.Point(30, $questionY)
    $questionLabel.Size = New-Object System.Drawing.Size(350, 25)
    $questionLabel.Font = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
    $questionLabel.ForeColor = [System.Drawing.Color]::FromArgb(73, 80, 87)
    
    # Buttons with better positioning and styling
    $buttonPanel = New-Object System.Windows.Forms.Panel
    $buttonPanel.Location = New-Object System.Drawing.Point(30, $buttonY)
    $buttonPanel.Size = New-Object System.Drawing.Size(520, 50)
    
    $yesButton = New-Object System.Windows.Forms.Button
    $yesButton.Text = "Yes, Install Update"
    $yesButton.Location = New-Object System.Drawing.Point(200, 5)
    $yesButton.Size = New-Object System.Drawing.Size(150, 35)
    $yesButton.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $yesButton.BackColor = [System.Drawing.Color]::FromArgb(40, 167, 69)
    $yesButton.ForeColor = [System.Drawing.Color]::White
    $yesButton.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
    $yesButton.FlatAppearance.BorderSize = 0
    $yesButton.DialogResult = [System.Windows.Forms.DialogResult]::Yes
    $yesButton.UseVisualStyleBackColor = $false
    
    $noButton = New-Object System.Windows.Forms.Button
    $noButton.Text = "No, Maybe Later"
    $noButton.Location = New-Object System.Drawing.Point(360, 5)
    $noButton.Size = New-Object System.Drawing.Size(130, 35)
    $noButton.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $noButton.BackColor = [System.Drawing.Color]::FromArgb(108, 117, 125)
    $noButton.ForeColor = [System.Drawing.Color]::White
    $noButton.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
    $noButton.FlatAppearance.BorderSize = 0
    $noButton.DialogResult = [System.Windows.Forms.DialogResult]::No
    $noButton.UseVisualStyleBackColor = $false
    
    $buttonPanel.Controls.Add($yesButton)
    $buttonPanel.Controls.Add($noButton)
    
    # Add all controls to form
    $form.Controls.Add($titleLabel)
    $form.Controls.Add($subtitleLabel)
    $form.Controls.Add($versionPanel)
    $form.Controls.Add($updatesTitle)
    $form.Controls.Add($updatesListBox)
    $form.Controls.Add($linkLabel)
    $form.Controls.Add($questionLabel)
    $form.Controls.Add($buttonPanel)
    
    # Set minimum form size based on content
    $minFormHeight = $buttonY + 80  # Button panel + margin
    $form.MinimumSize = New-Object System.Drawing.Size(580, $minFormHeight)
    $form.Size = New-Object System.Drawing.Size(580, $minFormHeight)
    
    # Set default buttons
    $form.AcceptButton = $yesButton
    $form.CancelButton = $noButton
    
    # Show dialog and return result
    $result = $form.ShowDialog()
    $form.Dispose()
    
    return $result -eq [System.Windows.Forms.DialogResult]::Yes
}

function Get-GitStatus {
    try {
        $status = git status --porcelain 2>$null
        $currentBranch = git branch --show-current 2>$null
        
        return @{
            HasChanges = -not [string]::IsNullOrEmpty($status)
            CurrentBranch = $currentBranch.Trim()
            Changes = $status
        }
    } catch {
        return @{
            HasChanges = $false
            CurrentBranch = "unknown"
            Changes = ""
        }
    }
}



function Handle-GitChanges {
    param(
        [object]$GitStatus
    )
    
    if (-not $GitStatus.HasChanges) {
        return $true
    }
    
    if ($GitStatus.CurrentBranch -ne "main") {
        Write-Log "You are on branch '$($GitStatus.CurrentBranch)'. Update will be performed on main branch only." "INFO"
        return $true
    }
    
    try {
        Write-Log "Local changes detected, preparing for merge..."
        
        # Add and commit current changes
        git add . 2>$null
        git commit -m "Auto-save before update - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" 2>$null
        
        Write-Log "Local changes committed successfully" "SUCCESS"
        return $true
    } catch {
        Write-Log "Warning: Could not commit local changes, proceeding with merge" "WARN"
        return $true
    }
}

function Perform-Update {
    try {
        Write-Log "Starting update process..."
        Show-Progress "Updating..." 10
        
        # Get current status
        $gitStatus = Get-GitStatus
        $originalBranch = $gitStatus.CurrentBranch
        
        # Handle changes if on main branch
        Handle-GitChanges -GitStatus $gitStatus
        
        Show-Progress "Fetching updates..." 30
        
        # Get the latest remote tag and checkout to it (user has accepted the update)
        $latestTag = Get-RemoteVersion
        if ($latestTag -ne "unknown") {
            Write-Log "Checking out to latest tag: $latestTag"
            git checkout $latestTag 2>$null
            
            if ($LASTEXITCODE -ne 0) {
                throw "Error checking out to tag $latestTag"
            }
            
            Write-Log "Successfully updated to version $latestTag" "SUCCESS"
        } else {
            throw "Cannot determine target version for update"
        }
        
        Show-Progress "Updating dependencies..." 60
        
        # Update Python packages if virtual environment exists
        if (Test-Path ".venv") {
            & ".\.venv\Scripts\Activate.ps1"
            pip install -r requirements.txt --upgrade --quiet
            deactivate
        }
        
        # Recreate scripts directory and script after checkout
        Show-Progress "Recreating scripts and shortcuts..." 80
        $scriptsDir = "scripts"
        if (-not (Test-Path $scriptsDir)) {
            New-Item -ItemType Directory -Path $scriptsDir -Force | Out-Null
        }
        
        # Download/copy the script to scripts folder
        try {
            $scriptPath = Join-Path -Path $scriptsDir -ChildPath "Sunshine-AIO.ps1"
            Invoke-RestMethod -Uri $script:ScriptUrl -OutFile $scriptPath -Method Get
            Write-Log "Script downloaded to scripts/Sunshine-AIO.ps1" "SUCCESS"
        } catch {
            Write-Log "Warning: Could not download script: $_" "WARN"
        }
        
        # Create shortcut at project root pointing to PowerShell script
        try {
            $shortcutPath = "Sunshine-AIO.lnk"
            $targetPath = "powershell.exe"
            $arguments = "-ExecutionPolicy Bypass -File `"scripts\Sunshine-AIO.ps1`""
            $iconPath = "ressources\sunshine-aio.ico"
            
            $WshShell = New-Object -comObject WScript.Shell
            $Shortcut = $WshShell.CreateShortcut($shortcutPath)
            $Shortcut.TargetPath = $targetPath
            $Shortcut.Arguments = $arguments
            $Shortcut.WorkingDirectory = (Get-Location).Path
            
            if (Test-Path $iconPath) {
                $Shortcut.IconLocation = (Resolve-Path $iconPath).Path
            }
            
            $Shortcut.Save()
            Write-Log "Desktop shortcut recreated: Sunshine-AIO.lnk" "SUCCESS"
        } catch {
            Write-Log "Warning: Could not recreate shortcut: $_" "WARN"
        }
        
        Show-Progress "Update completed" 100
        Write-Log "Update completed successfully!" "SUCCESS"
        
        return $true
        
    } catch {
        Write-Log "Error during update: $_" "ERROR"
        return $false
    }
}

function Check-ForUpdates {
    if ($SkipUpdateCheck) {
        Write-Log "Update check skipped" "INFO"
        return $false
    }
    
    if (-not $script:AllowGitUpdates) {
        Write-Log "Git updates disabled by user - skipping update check" "INFO"
        return $false
    }
    
    try {
        Write-Log "Checking for updates in background..."
        
        $currentVersion = Get-CurrentVersion
        $remoteVersion = Get-RemoteVersion
        $currentCommit = Get-CurrentCommit
        $remoteCommit = Get-RemoteCommit
        
        if ($remoteVersion -eq "unknown") {
            Write-Log "Cannot check for updates (no remote tags found)" "WARN"
            return $false
        }
        
        Write-Log "Current version: $currentVersion"
        Write-Log "Remote version: $remoteVersion"
        Write-Log "Current commit: $currentCommit"
        Write-Log "Remote commit: $remoteCommit"
        
        # Check if we need an update based on tags ONLY
        $needsUpdate = $false
        
        if ($currentVersion -eq "no-tag" -or $currentVersion -eq "unknown") {
            # If local has no tags, check if there are remote tags available
            if ($remoteVersion -ne "unknown") {
                $needsUpdate = $true
                Write-Log "No local tags found, but remote tags available" "INFO"
            }
        } elseif ($currentVersion -ne $remoteVersion) {
            # Compare tag versions - only update if tags are different
            $needsUpdate = $true
            Write-Log "Different tag versions detected ($currentVersion vs $remoteVersion)" "INFO"
        } else {
            # Same tag version - no update needed, regardless of commits
            Write-Log "Tags are identical ($currentVersion) - no update needed" "SUCCESS"
            $needsUpdate = $false
        }
        
        if ($needsUpdate) {
            Write-Log "Update available!" "INFO"
            
            # Get commit hash of current tag for changelog
            $fromCommit = if ($currentVersion -ne "no-tag" -and $currentVersion -ne "unknown") {
                $tagCommit = git rev-list -n 1 $currentVersion 2>$null
                if ($tagCommit) { $tagCommit.Trim() } else { $currentCommit }
            } else {
                $currentCommit
            }
            
            $summary = Get-CommitsSummary -FromCommit $fromCommit -ToCommit $remoteCommit
            
            # Create changelog URL
            $changelogUrl = "https://github.com/LeGeRyChEeSe/Sunshine-AIO/compare/$($fromCommit.Substring(0, 7))...$($remoteCommit.Substring(0, 7))"
            
            Write-Log "Showing update dialog to user..." "INFO"
            
            try {
                $userWantsUpdate = Show-UpdateDialog -CurrentVersion $currentVersion -RemoteVersion $remoteVersion -Summary $summary -ChangelogUrl $changelogUrl
                Write-Log "Update dialog returned: $userWantsUpdate" "INFO"
                
                if ($userWantsUpdate) {
                    Write-Log "User accepted the update"
                    return Perform-Update
                } else {
                    Write-Log "User declined the update - disabling automatic git updates"
                    $script:AllowGitUpdates = $false
                    return $false
                }
            } catch {
                Write-Log "Error showing update dialog: $_" "ERROR"
                Write-Log "Defaulting to no update" "INFO"
                return $false
            }
        } else {
            Write-Log "No updates available" "SUCCESS"
            return $false
        }
        
    } catch {
        Write-Log "Error checking for updates: $_" "WARN"
        return $false
    }
}

function Show-FolderBrowserDialog {
    param([string]$Description = "Select installation directory")
    
    try {
        Add-Type -AssemblyName System.Windows.Forms
        Add-Type -AssemblyName System.Drawing
        
        # Create main form
        $form = New-Object System.Windows.Forms.Form
        $form.Text = "Select Installation Directory - Sunshine-AIO"
        $form.Size = New-Object System.Drawing.Size(600, 450)
        $form.StartPosition = "CenterScreen"
        $form.FormBorderStyle = "FixedDialog"
        $form.MaximizeBox = $false
        $form.MinimizeBox = $false
        $form.BackColor = [System.Drawing.Color]::White
        
        # Title label
        $titleLabel = New-Object System.Windows.Forms.Label
        $titleLabel.Text = $Description
        $titleLabel.Location = New-Object System.Drawing.Point(20, 15)
        $titleLabel.Size = New-Object System.Drawing.Size(560, 25)
        $titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
        $titleLabel.ForeColor = [System.Drawing.Color]::FromArgb(0, 102, 204)
        
        # Quick access panel
        $quickAccessLabel = New-Object System.Windows.Forms.Label
        $quickAccessLabel.Text = "Quick Access Locations:"
        $quickAccessLabel.Location = New-Object System.Drawing.Point(20, 50)
        $quickAccessLabel.Size = New-Object System.Drawing.Size(200, 20)
        $quickAccessLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
        
        # Quick access buttons
        $buttonY = 75
        $buttonHeight = 35
        $buttonWidth = 260
        $spacing = 5
        
        $quickAccessFolders = @(
            @{ Name = "[Desktop]"; Path = [Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop) },
            @{ Name = "[Documents]"; Path = [Environment]::GetFolderPath([System.Environment+SpecialFolder]::MyDocuments) },
            @{ Name = "[Downloads]"; Path = (Join-Path $env:USERPROFILE "Downloads") },
            @{ Name = "[User Profile]"; Path = $env:USERPROFILE },
            @{ Name = "[C:\ Drive]"; Path = "C:\" }
        )
        
        $selectedPath = ""
        
        foreach ($folder in $quickAccessFolders) {
            $button = New-Object System.Windows.Forms.Button
            $button.Text = $folder.Name
            $button.Location = New-Object System.Drawing.Point(20, $buttonY)
            $button.Size = New-Object System.Drawing.Size($buttonWidth, $buttonHeight)
            $button.Font = New-Object System.Drawing.Font("Segoe UI", 10)
            $button.BackColor = [System.Drawing.Color]::FromArgb(248, 249, 250)
            $button.ForeColor = [System.Drawing.Color]::FromArgb(73, 80, 87)
            $button.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
            $button.FlatAppearance.BorderColor = [System.Drawing.Color]::FromArgb(206, 212, 218)
            $button.TextAlign = [System.Drawing.ContentAlignment]::MiddleLeft
            $button.Padding = New-Object System.Windows.Forms.Padding(10, 0, 0, 0)
            
            # Store path in button tag
            $button.Tag = $folder.Path
            
            # Add click event
            $button.Add_Click({
                param($sender, $e)
                $path = $sender.Tag
                if (Test-Path $path) {
                    $script:selectedPath = $path
                    $pathTextBox.Text = $path
                    $confirmButton.Enabled = $true
                } else {
                    [System.Windows.Forms.MessageBox]::Show("Path does not exist: $path", "Error", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Warning)
                }
            })
            
            $form.Controls.Add($button)
            $buttonY += $buttonHeight + $spacing
        }
        
        # Browse button
        $browseButtonY = $buttonY + 10
        $browseButton = New-Object System.Windows.Forms.Button
        $browseButton.Text = "Browse..."
        $browseButton.Location = New-Object System.Drawing.Point(20, $browseButtonY)
        $browseButton.Size = New-Object System.Drawing.Size($buttonWidth, $buttonHeight)
        $browseButton.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
        $browseButton.BackColor = [System.Drawing.Color]::FromArgb(0, 123, 255)
        $browseButton.ForeColor = [System.Drawing.Color]::White
        $browseButton.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
        $browseButton.FlatAppearance.BorderSize = 0
        
        $browseButton.Add_Click({
            $folderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog
            $folderBrowser.Description = "Select installation directory"
            $folderBrowser.RootFolder = [System.Environment+SpecialFolder]::MyComputer
            $folderBrowser.ShowNewFolderButton = $true
            
            if ($pathTextBox.Text -and (Test-Path $pathTextBox.Text)) {
                $folderBrowser.SelectedPath = $pathTextBox.Text
            }
            
            $result = $folderBrowser.ShowDialog()
            if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
                $script:selectedPath = $folderBrowser.SelectedPath
                $pathTextBox.Text = $folderBrowser.SelectedPath
                $confirmButton.Enabled = $true
            }
        })
        
        # Selected path display
        $pathLabel = New-Object System.Windows.Forms.Label
        $pathLabel.Text = "Selected path:"
        $pathLabel.Location = New-Object System.Drawing.Point(320, 50)
        $pathLabel.Size = New-Object System.Drawing.Size(100, 20)
        $pathLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
        
        $pathTextBox = New-Object System.Windows.Forms.TextBox
        $pathTextBox.Location = New-Object System.Drawing.Point(320, 75)
        $pathTextBox.Size = New-Object System.Drawing.Size(250, 25)
        $pathTextBox.Font = New-Object System.Drawing.Font("Segoe UI", 10)
        $pathTextBox.ReadOnly = $true
        $pathTextBox.BackColor = [System.Drawing.Color]::FromArgb(248, 249, 250)
        
        # Buttons panel
        $confirmButton = New-Object System.Windows.Forms.Button
        $confirmButton.Text = "Select This Folder"
        $confirmButton.Location = New-Object System.Drawing.Point(320, 350)
        $confirmButton.Size = New-Object System.Drawing.Size(120, 35)
        $confirmButton.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
        $confirmButton.BackColor = [System.Drawing.Color]::FromArgb(40, 167, 69)
        $confirmButton.ForeColor = [System.Drawing.Color]::White
        $confirmButton.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
        $confirmButton.FlatAppearance.BorderSize = 0
        $confirmButton.Enabled = $false
        
        $cancelButton = New-Object System.Windows.Forms.Button
        $cancelButton.Text = "Cancel"
        $cancelButton.Location = New-Object System.Drawing.Point(450, 350)
        $cancelButton.Size = New-Object System.Drawing.Size(100, 35)
        $cancelButton.Font = New-Object System.Drawing.Font("Segoe UI", 10)
        $cancelButton.BackColor = [System.Drawing.Color]::FromArgb(108, 117, 125)
        $cancelButton.ForeColor = [System.Drawing.Color]::White
        $cancelButton.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
        $cancelButton.FlatAppearance.BorderSize = 0
        $cancelButton.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
        
        $confirmButton.Add_Click({
            $form.DialogResult = [System.Windows.Forms.DialogResult]::OK
            $form.Close()
        })
        
        # Add all controls
        $form.Controls.Add($titleLabel)
        $form.Controls.Add($quickAccessLabel)
        $form.Controls.Add($browseButton)
        $form.Controls.Add($pathLabel)
        $form.Controls.Add($pathTextBox)
        $form.Controls.Add($confirmButton)
        $form.Controls.Add($cancelButton)
        
        # Set default buttons
        $form.AcceptButton = $confirmButton
        $form.CancelButton = $cancelButton
        
        # Show dialog
        $result = $form.ShowDialog()
        $form.Dispose()
        
        if ($result -eq [System.Windows.Forms.DialogResult]::OK -and $script:selectedPath) {
            return $script:selectedPath
        }
        
        return $null
    } catch {
        Write-Log "Error showing folder browser: $_" "WARN"
        return $null
    }
}

function Test-AdminRequired {
    param([string]$Path)
    
    # List of paths that typically require admin rights
    $adminPaths = @(
        $env:ProgramFiles,
        ${env:ProgramFiles(x86)},
        $env:windir,
        "C:\Program Files",
        "C:\Program Files (x86)",
        "C:\Windows"
    )
    
    # Check if path starts with any admin-required location
    foreach ($adminPath in $adminPaths) {
        if ($adminPath -and $Path.StartsWith($adminPath, [System.StringComparison]::OrdinalIgnoreCase)) {
            return $true
        }
    }
    
    # Test write access by trying to create a test file
    try {
        $testPath = Join-Path $Path "sunshine_test_$(Get-Random).tmp"
        $null = New-Item -Path $testPath -ItemType File -Force -ErrorAction Stop
        Remove-Item $testPath -Force -ErrorAction SilentlyContinue
        return $false
    } catch {
        return $true
    }
}

function Test-IsAdmin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Request-AdminElevation {
    param([string]$Path)
    
    Add-Type -AssemblyName System.Windows.Forms
    
    $result = [System.Windows.Forms.MessageBox]::Show(
        "The selected directory requires administrator privileges:`n`n$Path`n`nDo you want to restart the installer with administrator rights to continue?",
        "Administrator Rights Required - Sunshine-AIO",
        [System.Windows.Forms.MessageBoxButtons]::YesNo,
        [System.Windows.Forms.MessageBoxIcon]::Warning
    )
    
    if ($result -eq [System.Windows.Forms.DialogResult]::Yes) {
        try {
            # Restart script as administrator
            $arguments = ""
            if ($InstallPath -ne "") {
                $arguments += "-InstallPath `"$InstallPath`""
            }
            if ($SkipUpdateCheck) {
                $arguments += " -SkipUpdateCheck"
            }
            
            # If script has a path (not executed via irm|iex)
            if ($PSCommandPath) {
                Start-Process powershell -Verb RunAs -ArgumentList "-ExecutionPolicy Bypass -File `"$PSCommandPath`" $arguments"
            } else {
                # If executed via irm|iex, download and run as admin
                $adminScript = "Invoke-Expression (Invoke-RestMethod -Uri '$script:ScriptUrl')"
                Start-Process powershell -Verb RunAs -ArgumentList "-ExecutionPolicy Bypass -Command `"$adminScript`""
            }
            
            Write-Log "Restarting with administrator privileges..." "INFO"
            exit 0
        } catch {
            Write-Log "Failed to restart as administrator: $_" "ERROR"
            return $false
        }
    }
    
    return $false
}

function Analyze-SelectedPath {
    param([string]$SelectedPath)
    
    $folderName = Split-Path -Leaf $SelectedPath
    $result = @{
        Type = "Unknown"
        FinalPath = ""
        Action = ""
    }
    
    if ($folderName -eq "Sunshine-AIO") {
        # User selected a folder named "Sunshine-AIO"
        if (Test-Path (Join-Path $SelectedPath ".git")) {
            # Contains our git project
            $result.Type = "ExistingProject"
            $result.FinalPath = $SelectedPath
            $result.Action = "Update existing project"
        } else {
            # Empty or different project with same name
            $result.Type = "EmptyProjectFolder"
            $result.FinalPath = $SelectedPath
            $result.Action = "Clone into existing folder (no subfolder)"
        }
    } else {
        # User selected a parent directory
        $result.Type = "ParentDirectory"
        $result.FinalPath = Join-Path $SelectedPath "Sunshine-AIO"
        $result.Action = "Create Sunshine-AIO subfolder"
    }
    
    return $result
}

function Get-UserInstallPath {
    if ($InstallPath -ne "") {
        # Use provided path directly
        $selectedPath = $InstallPath
        $pathAnalysis = Analyze-SelectedPath -SelectedPath $selectedPath
        return @{
            Type = $pathAnalysis.Type
            FinalPath = $pathAnalysis.FinalPath
            Action = $pathAnalysis.Action
        }
    } else {
        Write-Host "`nInstallation Directory Selection" -ForegroundColor Magenta
        $desktopPath = [Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
        $defaultPath = Join-Path $desktopPath "Sunshine-AIO"
        Write-Host "By default, Sunshine-AIO will be installed in: $defaultPath" -ForegroundColor Cyan
        
        Write-Host "`nChoose installation method:" -ForegroundColor Yellow
        Write-Host "1. Use default location ($defaultPath)" -ForegroundColor Gray
        Write-Host "2. Browse and select custom directory" -ForegroundColor Gray
        
        do {
            $choice = Read-Host "Enter your choice (1-2)"
            
            switch ($choice) {
                "1" {
                    $selectedPath = $desktopPath
                    $pathAnalysis = Analyze-SelectedPath -SelectedPath $selectedPath
                    return @{
                        Type = "ParentDirectory"
                        FinalPath = Join-Path $selectedPath "Sunshine-AIO"
                        Action = "Create Sunshine-AIO on Desktop"
                    }
                }
                "2" {
                    $selectedPath = Show-FolderBrowserDialog -Description "Select directory for Sunshine-AIO installation"
                    if ($selectedPath) {
                        # Check if admin rights are required
                        if (Test-AdminRequired -Path $selectedPath) {
                            if (-not (Test-IsAdmin)) {
                                Write-Host "`nWarning: The selected directory requires administrator privileges." -ForegroundColor Yellow
                                Write-Host "Path: $selectedPath" -ForegroundColor Yellow
                                
                                if (Request-AdminElevation -Path $selectedPath) {
                                    # This will exit and restart as admin
                                    return
                                } else {
                                    Write-Host "Installation cancelled. Please select a different directory." -ForegroundColor Red
                                    continue
                                }
                            }
                        }
                        
                        $pathAnalysis = Analyze-SelectedPath -SelectedPath $selectedPath
                        Write-Host "`nSelected: $selectedPath" -ForegroundColor Green
                        Write-Host "Action: $($pathAnalysis.Action)" -ForegroundColor Cyan
                        Write-Host "Final path: $($pathAnalysis.FinalPath)" -ForegroundColor Cyan
                        
                        $confirm = Read-Host "Confirm this selection? (Y/n)"
                        if ($confirm -notmatch '^[nN]') {
                            return $pathAnalysis
                        }
                    } else {
                        Write-Host "No directory selected." -ForegroundColor Yellow
                    }
                }
                default {
                    Write-Host "Invalid choice. Please enter 1 or 2." -ForegroundColor Red
                }
            }
        } while ($true)
    }
}

# Enhanced Python detection and installation
function Test-PythonInstallation {
    $pythonCommands = @("py", "python", "python3")
    
    foreach ($cmd in $pythonCommands) {
        try {
            $output = & $cmd --version 2>&1
            if ($LASTEXITCODE -eq 0 -and $output -match "Python (\d+\.\d+\.\d+)") {
                $versionNumber = $matches[1]
                $version = [version]$versionNumber
                
                # Require Python 3.8 or higher
                if ($version.Major -eq 3 -and $version.Minor -ge 8) {
                    # Check if it's not Windows Store version (which can cause issues)
                    $pythonPath = (Get-Command $cmd -ErrorAction SilentlyContinue).Source
                    if ($pythonPath -and $pythonPath -notlike "*WindowsApps*") {
                        Write-Log "Compatible Python $versionNumber found with command '$cmd'" "SUCCESS"
                        return @{
                            Installed = $true
                            Command = $cmd
                            Version = $versionNumber
                            Path = $pythonPath
                        }
                    } else {
                        Write-Log "Python $versionNumber found but it's Windows Store version (may cause issues)" "WARN"
                    }
                } else {
                    Write-Log "Python $versionNumber found but version too old (minimum 3.8 required)" "WARN"
                }
            }
        } catch {
            continue
        }
    }
    
    return @{
        Installed = $false
        Command = ""
        Version = ""
        Path = ""
    }
}

function Get-LatestPythonVersion {
    try {
        Write-Log "Fetching latest Python version from python.org..."
        $pythonDownloadsUrl = "https://www.python.org/downloads/"
        $webContent = Invoke-WebRequest -Uri $pythonDownloadsUrl -UseBasicParsing
        
        # Look for the "Download Python X.Y.Z" button text
        if ($webContent.Content -match "Download Python (\d+\.\d+\.\d+)") {
            $latestVersion = $matches[1]
            Write-Log "Latest stable Python version: $latestVersion"
            return $latestVersion
        } else {
            throw "Could not parse version from downloads page"
        }
    } catch {
        Write-Log "Error fetching Python version: $_" "WARN"
        # Fallback to known stable version
        return "3.13.5"
    }
}

function Install-PythonLatest {
    Show-Progress "Installing latest Python version..." 30
    Write-Log "Installing latest Python version..."
    
    try {
        $latestVersion = Get-LatestPythonVersion
        $pythonUrl = "https://www.python.org/ftp/python/$latestVersion/python-$latestVersion-amd64.exe"
        $tempDir = New-Item -ItemType Directory -Path ([System.IO.Path]::GetTempPath() + "python-$(Get-Random).tmp") -Force
        $tempFile = Join-Path -Path $tempDir.FullName -ChildPath "python-$latestVersion-amd64.exe"
        
        # Download Python installer
        Write-Log "Downloading Python $latestVersion..."
        Show-Progress "Downloading Python $latestVersion..." 40
        
        try {
            Invoke-WebRequest -Uri $pythonUrl -OutFile $tempFile -UseBasicParsing
        } catch {
            Write-Log "Download failed: $_" "ERROR"
            throw "Failed to download Python installer"
        }
        
        # Verify download
        if (-not (Test-Path $tempFile) -or (Get-Item $tempFile).Length -lt 1MB) {
            throw "Downloaded file is invalid or corrupted"
        }
        
        Write-Log "Installing Python $latestVersion (this may take a few minutes)..."
        Show-Progress "Installing Python $latestVersion..." 60
        
        # Install Python with minimal options for automatic installation
        $installArgs = @(
            "/quiet",
            "InstallAllUsers=0",
            "PrependPath=1",
            "Include_test=0",
            "Include_doc=0",
            "Include_dev=0",
            "Include_debug=0",
            "Include_launcher=1",
            "InstallLauncherAllUsers=0"
        )
        
        $process = Start-Process -FilePath $tempFile -ArgumentList $installArgs -Wait -PassThru
        
        if ($process.ExitCode -ne 0) {
            throw "Python installation failed with exit code: $($process.ExitCode)"
        }
        
        # Refresh environment variables
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
        
        # Clean up
        Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
        
        Write-Log "Python $latestVersion installed successfully" "SUCCESS"
        Show-Progress "Python installation completed" 70
        
        # Verify installation
        Start-Sleep -Seconds 3
        $pythonCheck = Test-PythonInstallation
        if (-not $pythonCheck.Installed) {
            throw "Python installation verification failed"
        }
        
        return $pythonCheck.Command
        
    } catch {
        Write-Log "Error during Python installation: $_" "ERROR"
        throw
    }
}

function Install-Git {
    try {
        # Check if Git is already installed
        if (Get-Command -Name git -ErrorAction SilentlyContinue) {
            Write-Log "Git is already installed" "SUCCESS"
            return
        }
        
        Write-Log "Git is not installed. Installing Git..."
        Show-Progress "Installing Git..." 20
        
        # Get latest Git release info
        $gitReleasesUrl = "https://api.github.com/repos/git-for-windows/git/releases/latest"
        $latestRelease = Invoke-RestMethod -Uri $gitReleasesUrl -UseBasicParsing
        
        # Find 64-bit installer
        $asset = $latestRelease.assets | Where-Object { $_.name -like "*64-bit.exe" -and $_.name -notlike "*Portable*" } | Select-Object -First 1
        
        if (-not $asset) {
            throw "Could not find 64-bit Git installer"
        }
        
        $tempDir = New-Item -ItemType Directory -Path ([System.IO.Path]::GetTempPath() + "git-$(Get-Random).tmp") -Force
        $tempFile = Join-Path -Path $tempDir.FullName -ChildPath $asset.name
        
        Write-Log "Downloading Git $($latestRelease.tag_name)..."
        Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $tempFile -UseBasicParsing
        
        Write-Log "Installing Git..."
        $installArgs = @(
            "/VERYSILENT",
            "/NORESTART",
            "/COMPONENTS=icons,ext\reg\shellhere,assoc,assoc_sh"
        )
        
        $process = Start-Process -FilePath $tempFile -ArgumentList $installArgs -Wait -PassThru
        
        if ($process.ExitCode -ne 0) {
            throw "Git installation failed with exit code: $($process.ExitCode)"
        }
        
        # Refresh PATH
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
        
        # Clean up
        Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
        
        Write-Log "Git installed successfully" "SUCCESS"
        
    } catch {
        Write-Log "Error installing Git: $_" "ERROR"
        throw
    }
}

function Start-SunshineAIOInPlace {
    try {
        Write-Host "`nSunshine-AIO Installer v$script:ScriptVersion" -ForegroundColor Yellow
        Write-Host "Running from existing Sunshine-AIO directory" -ForegroundColor Green
        
        # Check for updates first (in background)
        $updatePerformed = Check-ForUpdates
        if ($updatePerformed) {
            Write-Log "Update completed, restarting application..." "SUCCESS"
            # Restart the script after update - handle both file execution and irm|iex
            if ($PSCommandPath) {
                & powershell -ExecutionPolicy Bypass -File $PSCommandPath @PSBoundParameters
            } else {
                # If executed via irm|iex, download and execute fresh script
                Write-Log "Re-executing script from web..." "INFO"
                Invoke-Expression (Invoke-RestMethod -Uri $script:ScriptUrl)
            }
            return
        }
        
        # Check and install Python if needed
        $pythonCheck = Test-PythonInstallation
        if (-not $pythonCheck.Installed) {
            Write-Log "Python not found or incompatible version detected. Installing latest Python..."
            $pythonCommand = Install-PythonLatest
        } else {
            Write-Log "Using existing Python installation: $($pythonCheck.Version)" "SUCCESS"
            $pythonCommand = $pythonCheck.Command
        }
        
        # Install Git if needed
        Install-Git
        
        # Update repository
        Write-Log "Updating Sunshine-AIO repository..."
        Show-Progress "Updating repository..." 50
        
        try {
            git fetch --tags
            # Just ensure we're on a proper state, don't force checkout
            $currentBranch = git branch --show-current 2>$null
            if (-not $currentBranch) {
                # If in detached HEAD (on a tag), stay there
                Write-Log "Currently on a tag/commit, keeping current position" "INFO"
            }
        } catch {
            Write-Log "Warning: Could not update repository: $_" "WARN"
        }
        
        # Create virtual environment if it doesn't exist
        if (-not (Test-Path ".venv")) {
            Write-Log "Creating Python virtual environment..."
            Show-Progress "Creating virtual environment..." 70
            & $pythonCommand -m venv .venv
        }
        
        # Activate virtual environment and install packages
        Write-Log "Installing Python packages..."
        Show-Progress "Installing packages..." 80
        
        & ".\.venv\Scripts\Activate.ps1"
        & $pythonCommand -m pip install --upgrade pip --quiet
        & pip install -r requirements.txt --quiet
        
        # Create tools directory and symlink if needed
        $toolsDir = "src\tools"
        if (-not (Test-Path $toolsDir)) {
            New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null
        }
        
        $toolsLink = "tools"
        if (-not (Test-Path $toolsLink)) {
            New-Item -ItemType Junction -Path $toolsLink -Target $toolsDir -Force | Out-Null
        }
        
        # Create scripts directory and copy the current script
        $scriptsDir = "scripts"
        if (-not (Test-Path $scriptsDir)) {
            New-Item -ItemType Directory -Path $scriptsDir -Force | Out-Null
        }
        
        # Download/copy the script to scripts folder
        try {
            $scriptPath = Join-Path -Path $scriptsDir -ChildPath "Sunshine-AIO.ps1"
            Invoke-RestMethod -Uri $script:ScriptUrl -OutFile $scriptPath -Method Get
            Write-Log "Script downloaded to scripts/Sunshine-AIO.ps1" "SUCCESS"
        } catch {
            Write-Log "Warning: Could not download script: $_" "WARN"
        }
        
        # Create shortcut at project root pointing directly to PowerShell script
        try {
            $shortcutPath = "Sunshine-AIO.lnk"
            $targetPath = "powershell.exe"
            $arguments = "-ExecutionPolicy Bypass -File `"scripts\Sunshine-AIO.ps1`""
            $iconPath = "ressources\sunshine-aio.ico"
            
            # Create WScript.Shell object
            $WshShell = New-Object -comObject WScript.Shell
            $Shortcut = $WshShell.CreateShortcut($shortcutPath)
            $Shortcut.TargetPath = $targetPath
            $Shortcut.Arguments = $arguments
            $Shortcut.WorkingDirectory = (Get-Location).Path
            
            # Set icon if it exists
            if (Test-Path $iconPath) {
                $Shortcut.IconLocation = (Resolve-Path $iconPath).Path
            }
            
            $Shortcut.Save()
            Write-Log "Desktop shortcut created: Sunshine-AIO.lnk" "SUCCESS"
        } catch {
            Write-Log "Warning: Could not create shortcut: $_" "WARN"
        }
        
        Write-Log "Setup completed successfully!" "SUCCESS"
        
        # Move log file to installation directory
        Move-LogToInstallDirectory -InstallPath (Get-Location).Path
        
        # Run the application
        Write-Log "Starting Sunshine-AIO..."
        Show-Progress "Starting application..." 100
        
        Set-Location "src"
        & $pythonCommand main.py
        
        # Deactivate virtual environment
        deactivate
        
    } catch {
        Write-Log "Error during Sunshine-AIO setup: $_" "ERROR"
        throw
    }
}

function Install-SunshineAIO {
    param([object]$PathInfo, [string]$PythonCommand)
    
    try {
        $sunshineAioPath = $PathInfo.FinalPath
        Write-Log "Installation type: $($PathInfo.Type)" "INFO"
        Write-Log "Action: $($PathInfo.Action)" "INFO"
        Write-Log "Target path: $sunshineAioPath" "INFO"
        
        switch ($PathInfo.Type) {
            "ExistingProject" {
                # Directory exists and contains our git project
                Write-Log "Found existing Sunshine-AIO project. Updating..."
                Show-Progress "Updating existing installation..." 80
                
                Set-Location $sunshineAioPath
                git fetch --tags
                Write-Log "Repository fetched successfully" "SUCCESS"
            }
            
            "EmptyProjectFolder" {
                # Directory named "Sunshine-AIO" exists but is empty/different project
                Write-Log "Cloning into existing Sunshine-AIO folder..."
                Show-Progress "Cloning repository..." 75
                
                # Clear the directory first
                if (Test-Path $sunshineAioPath) {
                    Get-ChildItem -Path $sunshineAioPath -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
                }
                
                # Clone directly into the existing folder
                $parentPath = Split-Path $sunshineAioPath -Parent
                Set-Location $parentPath
                git clone https://github.com/LeGeRyChEeSe/Sunshine-AIO.git (Split-Path $sunshineAioPath -Leaf)
                Set-Location $sunshineAioPath
                
                # Checkout to latest tag
                Write-Log "Checking out to latest version..."
                git fetch --tags
                $latestTag = git tag -l --sort=-version:refname | Select-Object -First 1
                if ($latestTag) {
                    Write-Log "Switching to latest version: $($latestTag.Trim())"
                    git checkout $latestTag.Trim()
                }
            }
            
            "ParentDirectory" {
                # Standard installation - create Sunshine-AIO subdirectory
                # Check if Sunshine-AIO already exists in parent
                if (Test-Path $sunshineAioPath) {
                    Write-Log "Sunshine-AIO directory already exists. Updating..."
                    Show-Progress "Updating existing installation..." 80
                    
                    Set-Location $sunshineAioPath
                    git fetch --tags
                    Write-Log "Repository fetched successfully" "SUCCESS"
                } else {
                    Write-Log "Cloning Sunshine-AIO repository..."
                    Show-Progress "Cloning repository..." 75
                    
                    $parentPath = Split-Path $sunshineAioPath -Parent
                    Set-Location $parentPath
                    git clone https://github.com/LeGeRyChEeSe/Sunshine-AIO.git
                    Set-Location $sunshineAioPath
                    
                    # Checkout to latest tag
                    Write-Log "Checking out to latest version..."
                    git fetch --tags
                    $latestTag = git tag -l --sort=-version:refname | Select-Object -First 1
                    if ($latestTag) {
                        Write-Log "Switching to latest version: $($latestTag.Trim())"
                        git checkout $latestTag.Trim()
                    }
                }
            }
        }
        
        # Create virtual environment if it doesn't exist
        if (-not (Test-Path "$sunshineAioPath\.venv")) {
            Write-Log "Creating Python virtual environment..."
            Show-Progress "Creating virtual environment..." 85
            & $PythonCommand -m venv .venv
        }
        
        # Activate virtual environment and install packages
        Write-Log "Installing Python packages..."
        Show-Progress "Installing packages..." 90
        
        & "$sunshineAioPath\.venv\Scripts\Activate.ps1"
        & $PythonCommand -m pip install --upgrade pip --quiet
        & pip install -r requirements.txt --quiet
        
        # Create tools directory and symlink if needed
        $toolsDir = Join-Path $sunshineAioPath "src\tools"
        if (-not (Test-Path $toolsDir)) {
            New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null
        }
        
        $toolsLink = Join-Path $sunshineAioPath "tools"
        if (-not (Test-Path $toolsLink)) {
            New-Item -ItemType Junction -Path $toolsLink -Target $toolsDir -Force | Out-Null
        }
        
        # Create scripts directory and copy the current script
        $scriptsDir = Join-Path -Path $sunshineAioPath -ChildPath "scripts"
        if (-not (Test-Path $scriptsDir)) {
            New-Item -ItemType Directory -Path $scriptsDir -Force | Out-Null
        }
        
        # Download/copy the script to scripts folder
        try {
            $scriptPath = Join-Path -Path $scriptsDir -ChildPath "Sunshine-AIO.ps1"
            Invoke-RestMethod -Uri $script:ScriptUrl -OutFile $scriptPath -Method Get
            Write-Log "Script downloaded to scripts/Sunshine-AIO.ps1" "SUCCESS"
        } catch {
            Write-Log "Warning: Could not download script: $_" "WARN"
        }
        
        # Create shortcut at project root pointing directly to PowerShell script
        try {
            $shortcutPath = Join-Path -Path $sunshineAioPath -ChildPath "Sunshine-AIO.lnk"
            $targetPath = "powershell.exe"
            $arguments = "-ExecutionPolicy Bypass -File `"scripts\Sunshine-AIO.ps1`""
            $iconPath = Join-Path -Path $sunshineAioPath -ChildPath "ressources\sunshine-aio.ico"
            
            # Create WScript.Shell object
            $WshShell = New-Object -comObject WScript.Shell
            $Shortcut = $WshShell.CreateShortcut($shortcutPath)
            $Shortcut.TargetPath = $targetPath
            $Shortcut.Arguments = $arguments
            $Shortcut.WorkingDirectory = $sunshineAioPath
            
            # Set icon if it exists
            if (Test-Path $iconPath) {
                $Shortcut.IconLocation = (Resolve-Path $iconPath).Path
            }
            
            $Shortcut.Save()
            Write-Log "Desktop shortcut created: Sunshine-AIO.lnk" "SUCCESS"
        } catch {
            Write-Log "Warning: Could not create shortcut: $_" "WARN"
        }
        
        Write-Log "Installation completed successfully!" "SUCCESS"
        Show-Progress "Installation completed" 95
        
        # Move log file to installation directory
        Move-LogToInstallDirectory -InstallPath $sunshineAioPath
        
        # Check for updates before running (if not a fresh installation)
        Set-Location $sunshineAioPath
        if (Test-Path ".git") {
            $updatePerformed = Check-ForUpdates
            if ($updatePerformed) {
                Write-Log "Update completed, restarting application..." "SUCCESS"
                # Restart the script after update - use local script file if available
                $localScriptPath = "scripts\Sunshine-AIO.ps1"
                if (Test-Path $localScriptPath) {
                    & powershell -ExecutionPolicy Bypass -File $localScriptPath @PSBoundParameters
                } else {
                    # Fallback to web execution
                    Write-Log "Local script not found, re-executing from web..." "INFO"
                    Invoke-Expression (Invoke-RestMethod -Uri $script:ScriptUrl)
                }
                return
            }
        }
        
        # Run the application
        Write-Log "Starting Sunshine-AIO..."
        Show-Progress "Starting application..." 100
        
        Set-Location "$sunshineAioPath\src"
        & $PythonCommand main.py
        
        # Deactivate virtual environment
        deactivate
        
    } catch {
        Write-Log "Error during Sunshine-AIO installation: $_" "ERROR"
        throw
    }
}

# Main installation process
function Start-Installation {
    try {
        Write-Host "Sunshine-AIO Installer v$script:ScriptVersion" -ForegroundColor Yellow
        Write-Host "========================================" -ForegroundColor Yellow
        Write-Log "Starting Sunshine-AIO installation process (Script v$script:ScriptVersion)..."
        
        # Check if we're already in Sunshine-AIO directory
        $currentDir = Get-Location
        $currentDirName = Split-Path -Leaf $currentDir
        
        if ($currentDirName -eq "Sunshine-AIO") {
            Write-Log "Already in Sunshine-AIO directory, updating and starting..." "SUCCESS"
            Start-SunshineAIOInPlace
            return
        }
        
        # Check internet connection
        if (-not (Test-InternetConnection)) {
            throw "No internet connection detected. Please check your network connection."
        }
        
        # Set execution policy
        try {
            Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        } catch {
            Write-Log "Could not set execution policy: $_" "WARN"
        }
        
        Show-Progress "Checking system requirements..." 5
        
        # Check and install Python
        $pythonCheck = Test-PythonInstallation
        if (-not $pythonCheck.Installed) {
            Write-Log "Python not found or incompatible version detected. Installing latest Python..."
            $pythonCommand = Install-PythonLatest
        } else {
            Write-Log "Using existing Python installation: $($pythonCheck.Version)" "SUCCESS"
            $pythonCommand = $pythonCheck.Command
        }
        
        Show-Progress "Installing Git..." 25
        Install-Git
        
        # Get installation path with intelligent path analysis
        $pathInfo = Get-UserInstallPath
        Write-Log "Installation directory: $($pathInfo.FinalPath)"
        Write-Log "Installation strategy: $($pathInfo.Action)"
        
        # Install Sunshine-AIO
        Install-SunshineAIO -PathInfo $pathInfo -PythonCommand $pythonCommand
        
        Write-Host "`nInstallation completed successfully!" -ForegroundColor Green
        Write-Host "Sunshine-AIO has been installed and started." -ForegroundColor Green
        Write-Host "Log file available at: $script:LogFile" -ForegroundColor Gray
        
    } catch {
        Write-Log "Installation failed: $_" "ERROR"
        Write-Host "`nInstallation failed!" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        Write-Host "Check the log file for details: $script:LogFile" -ForegroundColor Gray
        exit 1
    } finally {
        Write-Progress -Activity $script:ProgressActivity -Completed
    }
}

# Initialize log file
"" | Out-File -FilePath $script:LogFile -Force

# Start installation
Start-Installation