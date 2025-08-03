# TEST VERSION - Sunshine-AIO Installation Script with Auto-Update
# This version is for testing purposes only - uses test repository
# Version: 1.0.0-test

param(
    [string]$InstallPath = "",
    [switch]$SkipUpdateCheck = $false,
    [string]$TestRepo = "https://github.com/LeGeRyChEeSe/Sunshine-AIO.git"  # Can be changed for testing
)

# Script version
$script:ScriptVersion = "1.0.0-test"

# Set strict mode for better error detection
Set-StrictMode -Version Latest

# Initialize global variables
$script:LogFile = Join-Path $env:TEMP "sunshine-aio-install-test.log"
$script:ProgressActivity = "Testing Sunshine-AIO Auto-Update"
$script:ScriptUrl = "https://sunshine-aio.com/script.ps1"

# Utility Functions
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] [TEST] $Message"
    Add-Content -Path $script:LogFile -Value $logEntry -ErrorAction SilentlyContinue
    
    switch ($Level) {
        "ERROR" { Write-Host "[TEST-ERROR] $Message" -ForegroundColor Red }
        "WARN"  { Write-Host "[TEST-WARN]  $Message" -ForegroundColor Yellow }
        "SUCCESS" { Write-Host "[TEST-OK]    $Message" -ForegroundColor Green }
        default { Write-Host "[TEST-INFO]  $Message" -ForegroundColor Cyan }
    }
}

function Show-Progress {
    param([string]$Status, [int]$PercentComplete = 0)
    Write-Progress -Activity $script:ProgressActivity -Status $Status -PercentComplete $PercentComplete
}

function Get-CurrentVersion {
    try {
        if (Test-Path ".git") {
            # First try to get the exact tag for current commit
            $version = git describe --tags --exact-match HEAD 2>$null
            if ($LASTEXITCODE -eq 0 -and $version) {
                return $version.Trim()
            }
            
            # If not on exact tag, get the latest published tag (not the commit-extended version)
            $latestTag = git describe --tags --abbrev=0 HEAD 2>$null
            if ($LASTEXITCODE -eq 0 -and $latestTag) {
                return $latestTag.Trim()
            }
            
            # Fallback to commit hash
            $commit = git rev-parse --short HEAD 2>$null
            if ($LASTEXITCODE -eq 0 -and $commit) {
                return $commit.Trim()
            }
        }
        return "unknown"
    } catch {
        Write-Log "Error getting current version: $_" "WARN"
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

function Get-RemoteVersion {
    try {
        git fetch origin main --quiet 2>$null
        git fetch origin --tags --quiet 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            # Try to get the latest tag from remote
            $version = git describe --tags --exact-match origin/main 2>$null
            if ($LASTEXITCODE -eq 0 -and $version) {
                return $version.Trim()
            }
            
            # If no exact tag, get the latest tag with commit info
            $version = git describe --tags --always origin/main 2>$null
            if ($LASTEXITCODE -eq 0 -and $version) {
                return $version.Trim()
            }
            
            # Fallback to commit hash
            $remoteCommit = git rev-parse --short origin/main 2>$null
            if ($LASTEXITCODE -eq 0 -and $remoteCommit) {
                return $remoteCommit.Trim()
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
    $form.Text = "[TEST] Update Available - Sunshine-AIO"
    $form.StartPosition = "CenterScreen"
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false
    $form.MinimizeBox = $false
    $form.Icon = [System.Drawing.SystemIcons]::Information
    $form.BackColor = [System.Drawing.Color]::White
    $form.AutoSize = $true
    $form.AutoSizeMode = [System.Windows.Forms.AutoSizeMode]::GrowAndShrink
    
    # TEST banner
    $testBanner = New-Object System.Windows.Forms.Label
    $testBanner.Text = "TEST MODE"
    $testBanner.Location = New-Object System.Drawing.Point(30, 15)
    $testBanner.Size = New-Object System.Drawing.Size(520, 20)
    $testBanner.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
    $testBanner.ForeColor = [System.Drawing.Color]::FromArgb(220, 53, 69)
    $testBanner.BackColor = [System.Drawing.Color]::FromArgb(255, 243, 205)
    $testBanner.TextAlign = [System.Drawing.ContentAlignment]::MiddleCenter
    $testBanner.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
    
    # Title label
    $titleLabel = New-Object System.Windows.Forms.Label
    $titleLabel.Text = "Update Available"
    $titleLabel.Location = New-Object System.Drawing.Point(30, 50)
    $titleLabel.Size = New-Object System.Drawing.Size(520, 35)
    $titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $titleLabel.ForeColor = [System.Drawing.Color]::FromArgb(0, 102, 204)
    
    # Subtitle
    $subtitleLabel = New-Object System.Windows.Forms.Label
    $subtitleLabel.Text = "A new version of Sunshine-AIO is available!"
    $subtitleLabel.Location = New-Object System.Drawing.Point(30, 95)
    $subtitleLabel.Size = New-Object System.Drawing.Size(520, 25)
    $subtitleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 11)
    $subtitleLabel.ForeColor = [System.Drawing.Color]::FromArgb(64, 64, 64)
    
    # Version info section
    $versionPanel = New-Object System.Windows.Forms.Panel
    $versionPanel.Location = New-Object System.Drawing.Point(30, 140)
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
    $updatesTitle.Location = New-Object System.Drawing.Point(30, 240)
    $updatesTitle.Size = New-Object System.Drawing.Size(520, 25)
    $updatesTitle.Font = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
    $updatesTitle.ForeColor = [System.Drawing.Color]::FromArgb(73, 80, 87)
    
    # Updates content - simple one commit per line
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
    
    $updatesListBox.Location = New-Object System.Drawing.Point(30, 275)
    $updatesListBox.Size = New-Object System.Drawing.Size(520, $calculatedHeight)
    $updatesListBox.Font = New-Object System.Drawing.Font("Segoe UI", 10)
    $updatesListBox.BackColor = [System.Drawing.Color]::FromArgb(248, 249, 250)
    $updatesListBox.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
    $updatesListBox.SelectionMode = [System.Windows.Forms.SelectionMode]::None
    $updatesListBox.ForeColor = [System.Drawing.Color]::FromArgb(73, 80, 87)
    
    # Calculate dynamic positions based on listbox height
    $testNoteY = 275 + $calculatedHeight + 20
    $linkY = $testNoteY + 30
    $questionY = $linkY + 35
    $buttonY = $questionY + 35
    
    # Test note
    $testNote = New-Object System.Windows.Forms.Label
    $testNote.Text = "This is a TEST - real update will be simulated"
    $testNote.Location = New-Object System.Drawing.Point(30, $testNoteY)
    $testNote.Size = New-Object System.Drawing.Size(520, 20)
    $testNote.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Italic)
    $testNote.ForeColor = [System.Drawing.Color]::FromArgb(220, 53, 69)
    $testNote.TextAlign = [System.Drawing.ContentAlignment]::MiddleCenter
    
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
    $yesButton.Text = "Yes, Simulate Update"
    $yesButton.Location = New-Object System.Drawing.Point(180, 5)
    $yesButton.Size = New-Object System.Drawing.Size(170, 35)
    $yesButton.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $yesButton.BackColor = [System.Drawing.Color]::FromArgb(255, 193, 7)
    $yesButton.ForeColor = [System.Drawing.Color]::FromArgb(73, 80, 87)
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
    $form.Controls.Add($testBanner)
    $form.Controls.Add($titleLabel)
    $form.Controls.Add($subtitleLabel)
    $form.Controls.Add($versionPanel)
    $form.Controls.Add($updatesTitle)
    $form.Controls.Add($updatesListBox)
    $form.Controls.Add($testNote)
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

function Simulate-Update {
    try {
        Write-Log "SIMULATING update process..." "INFO"
        Show-Progress "Simulating update..." 10
        
        Show-Progress "Fetching updates..." 30
        git fetch origin main
        
        Show-Progress "Simulating git pull..." 60
        Write-Log "Would execute: git pull origin main" "INFO"
        
        Show-Progress "Simulating dependency update..." 80
        Write-Log "Would execute: pip install -r requirements.txt --upgrade" "INFO"
        
        Show-Progress "Simulation completed" 100
        Write-Log "UPDATE SIMULATION completed successfully!" "SUCCESS"
        
        return $true
        
    } catch {
        Write-Log "Error during update simulation: $_" "ERROR"
        return $false
    }
}

function Check-LocalChanges {
    try {
        # Check if there are uncommitted changes
        $status = git status --porcelain 2>$null
        if ($LASTEXITCODE -eq 0 -and $status) {
            return $true
        }
        return $false
    } catch {
        return $false
    }
}

function Show-ChangesDialog {
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "[TEST] Uncommitted Changes Detected"
    $form.Size = New-Object System.Drawing.Size(500, 300)
    $form.StartPosition = "CenterScreen"
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false
    $form.MinimizeBox = $false
    $form.Icon = [System.Drawing.SystemIcons]::Warning
    $form.BackColor = [System.Drawing.Color]::White
    
    # Warning message
    $label = New-Object System.Windows.Forms.Label
    $label.Text = "You have uncommitted changes in your project.`nWhat would you like to do before updating?"
    $label.Location = New-Object System.Drawing.Point(30, 30)
    $label.Size = New-Object System.Drawing.Size(440, 60)
    $label.Font = New-Object System.Drawing.Font("Segoe UI", 11)
    $label.ForeColor = [System.Drawing.Color]::FromArgb(73, 80, 87)
    
    # Buttons
    $saveButton = New-Object System.Windows.Forms.Button
    $saveButton.Text = "Save Changes (Commit)"
    $saveButton.Location = New-Object System.Drawing.Point(50, 120)
    $saveButton.Size = New-Object System.Drawing.Size(150, 35)
    $saveButton.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $saveButton.BackColor = [System.Drawing.Color]::FromArgb(40, 167, 69)
    $saveButton.ForeColor = [System.Drawing.Color]::White
    $saveButton.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
    $saveButton.DialogResult = [System.Windows.Forms.DialogResult]::Yes
    
    $discardButton = New-Object System.Windows.Forms.Button
    $discardButton.Text = "Discard Changes"
    $discardButton.Location = New-Object System.Drawing.Point(220, 120)
    $discardButton.Size = New-Object System.Drawing.Size(120, 35)
    $discardButton.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $discardButton.BackColor = [System.Drawing.Color]::FromArgb(220, 53, 69)
    $discardButton.ForeColor = [System.Drawing.Color]::White
    $discardButton.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
    $discardButton.DialogResult = [System.Windows.Forms.DialogResult]::No
    
    $branchButton = New-Object System.Windows.Forms.Button
    $branchButton.Text = "Create Branch"
    $branchButton.Location = New-Object System.Drawing.Point(360, 120)
    $branchButton.Size = New-Object System.Drawing.Size(100, 35)
    $branchButton.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $branchButton.BackColor = [System.Drawing.Color]::FromArgb(255, 193, 7)
    $branchButton.ForeColor = [System.Drawing.Color]::FromArgb(73, 80, 87)
    $branchButton.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
    $branchButton.DialogResult = [System.Windows.Forms.DialogResult]::Retry
    
    $cancelButton = New-Object System.Windows.Forms.Button
    $cancelButton.Text = "Cancel Update"
    $cancelButton.Location = New-Object System.Drawing.Point(200, 180)
    $cancelButton.Size = New-Object System.Drawing.Size(120, 35)
    $cancelButton.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $cancelButton.BackColor = [System.Drawing.Color]::FromArgb(108, 117, 125)
    $cancelButton.ForeColor = [System.Drawing.Color]::White
    $cancelButton.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
    $cancelButton.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
    
    $form.Controls.Add($label)
    $form.Controls.Add($saveButton)
    $form.Controls.Add($discardButton)
    $form.Controls.Add($branchButton)
    $form.Controls.Add($cancelButton)
    
    $form.AcceptButton = $saveButton
    $form.CancelButton = $cancelButton
    
    $result = $form.ShowDialog()
    $form.Dispose()
    
    return $result
}

function Show-CommitDialog {
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "[TEST] Commit Changes"
    $form.Size = New-Object System.Drawing.Size(500, 300)
    $form.StartPosition = "CenterScreen"
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false
    $form.MinimizeBox = $false
    $form.BackColor = [System.Drawing.Color]::White
    
    # Title label
    $titleLabel = New-Object System.Windows.Forms.Label
    $titleLabel.Text = "Commit Message"
    $titleLabel.Location = New-Object System.Drawing.Point(20, 20)
    $titleLabel.Size = New-Object System.Drawing.Size(200, 20)
    $titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    
    # Commit message textbox
    $messageTextBox = New-Object System.Windows.Forms.TextBox
    $messageTextBox.Location = New-Object System.Drawing.Point(20, 50)
    $messageTextBox.Size = New-Object System.Drawing.Size(440, 20)
    $messageTextBox.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $messageTextBox.Text = "Save changes before update"
    
    # Description label
    $descLabel = New-Object System.Windows.Forms.Label
    $descLabel.Text = "Description (optional)"
    $descLabel.Location = New-Object System.Drawing.Point(20, 90)
    $descLabel.Size = New-Object System.Drawing.Size(200, 20)
    $descLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    
    # Description textbox
    $descTextBox = New-Object System.Windows.Forms.TextBox
    $descTextBox.Location = New-Object System.Drawing.Point(20, 120)
    $descTextBox.Size = New-Object System.Drawing.Size(440, 60)
    $descTextBox.Multiline = $true
    $descTextBox.ScrollBars = "Vertical"
    $descTextBox.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    
    # Buttons
    $okButton = New-Object System.Windows.Forms.Button
    $okButton.Text = "Commit"
    $okButton.Location = New-Object System.Drawing.Point(300, 200)
    $okButton.Size = New-Object System.Drawing.Size(80, 30)
    $okButton.DialogResult = [System.Windows.Forms.DialogResult]::OK
    
    $cancelButton = New-Object System.Windows.Forms.Button
    $cancelButton.Text = "Cancel"
    $cancelButton.Location = New-Object System.Drawing.Point(390, 200)
    $cancelButton.Size = New-Object System.Drawing.Size(80, 30)
    $cancelButton.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
    
    $form.Controls.Add($titleLabel)
    $form.Controls.Add($messageTextBox)
    $form.Controls.Add($descLabel)
    $form.Controls.Add($descTextBox)
    $form.Controls.Add($okButton)
    $form.Controls.Add($cancelButton)
    
    $form.AcceptButton = $okButton
    $form.CancelButton = $cancelButton
    
    $result = $form.ShowDialog()
    
    if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
        $commitMessage = $messageTextBox.Text.Trim()
        $description = $descTextBox.Text.Trim()
        
        if ($description) {
            $fullMessage = "$commitMessage`n`n$description"
        } else {
            $fullMessage = $commitMessage
        }
        
        $form.Dispose()
        return $fullMessage
    }
    
    $form.Dispose()
    return $null
}


function Show-BranchNameDialog {
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "[TEST] Create New Branch"
    $form.Size = New-Object System.Drawing.Size(400, 180)
    $form.StartPosition = "CenterScreen"
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false
    $form.MinimizeBox = $false
    $form.BackColor = [System.Drawing.Color]::White
    
    # Title label
    $titleLabel = New-Object System.Windows.Forms.Label
    $titleLabel.Text = "Enter branch name:"
    $titleLabel.Location = New-Object System.Drawing.Point(20, 20)
    $titleLabel.Size = New-Object System.Drawing.Size(200, 20)
    $titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    
    # Branch name textbox
    $branchTextBox = New-Object System.Windows.Forms.TextBox
    $branchTextBox.Location = New-Object System.Drawing.Point(20, 50)
    $branchTextBox.Size = New-Object System.Drawing.Size(340, 20)
    $branchTextBox.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $branchTextBox.Text = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    
    # Buttons
    $okButton = New-Object System.Windows.Forms.Button
    $okButton.Text = "Create"
    $okButton.Location = New-Object System.Drawing.Point(200, 90)
    $okButton.Size = New-Object System.Drawing.Size(80, 30)
    $okButton.DialogResult = [System.Windows.Forms.DialogResult]::OK
    
    $cancelButton = New-Object System.Windows.Forms.Button
    $cancelButton.Text = "Cancel"
    $cancelButton.Location = New-Object System.Drawing.Point(290, 90)
    $cancelButton.Size = New-Object System.Drawing.Size(80, 30)
    $cancelButton.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
    
    $form.Controls.Add($titleLabel)
    $form.Controls.Add($branchTextBox)
    $form.Controls.Add($okButton)
    $form.Controls.Add($cancelButton)
    
    $form.AcceptButton = $okButton
    $form.CancelButton = $cancelButton
    
    $result = $form.ShowDialog()
    
    if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
        $branchName = $branchTextBox.Text.Trim()
        $form.Dispose()
        return $branchName
    }
    
    $form.Dispose()
    return $null
}

function Handle-LocalChanges {
    $choice = Show-ChangesDialog
    
    switch ($choice) {
        "Yes" { # Save changes
            Write-Log "User chose to save changes" "INFO"
            $commitMessage = Show-CommitDialog
            if ($commitMessage) {
                try {
                    git add -A
                    git commit -m $commitMessage
                    Write-Log "Changes committed successfully" "SUCCESS"
                    return $true
                } catch {
                    Write-Log "Failed to commit changes: $_" "ERROR"
                    return $false
                }
            } else {
                Write-Log "Commit cancelled by user" "INFO"
                return $false
            }
        }
        "No" { # Discard changes
            Write-Log "User chose to discard changes" "WARN"
            try {
                git reset --hard HEAD
                git clean -fd
                Write-Log "All changes discarded" "SUCCESS"
                return $true
            } catch {
                Write-Log "Failed to discard changes: $_" "ERROR"
                return $false
            }
        }
        "Retry" { # Create branch
            Write-Log "User chose to create branch" "INFO"
            $branchName = Show-BranchNameDialog
            if ($branchName) {
                try {
                    git checkout -b $branchName
                    git add -A
                    git commit -m "Backup changes before update"
                    git checkout main
                    Write-Log "Changes saved to branch: $branchName" "SUCCESS"
                    return $true
                } catch {
                    Write-Log "Failed to create branch: $_" "ERROR"
                    return $false
                }
            } else {
                Write-Log "Branch creation cancelled by user" "INFO"
                return $false
            }
        }
        default { # Cancel
            Write-Log "User cancelled update" "INFO"
            return $false
        }
    }
}

function Check-ForUpdates {
    if ($SkipUpdateCheck) {
        Write-Log "Update check skipped" "INFO"
        return $false
    }
    
    try {
        Write-Log "Checking for updates in background..."
        
        $currentVersion = Get-CurrentVersion
        $remoteVersion = Get-RemoteVersion
        $currentCommit = Get-CurrentCommit
        $remoteCommit = Get-RemoteCommit
        $lastPublishedCommit = Get-LastPublishedTag
        
        if ($remoteCommit -eq "unknown") {
            Write-Log "Cannot check for updates (repository not initialized)" "WARN"
            return $false
        }
        
        Write-Log "Current version: $currentVersion"
        Write-Log "Remote version: $remoteVersion"
        Write-Log "Last published commit: $lastPublishedCommit"
        Write-Log "Remote commit: $remoteCommit"
        
        # Use published tag for comparison, fallback to current commit if no tag found
        $compareCommit = if ($lastPublishedCommit -ne "unknown") { $lastPublishedCommit } else { $currentCommit }
        
        # Compare with published tag instead of current commit
        if ($compareCommit -ne $remoteCommit) {
            Write-Log "Update available!" "INFO"
            
            # Use the same commit for changelog that we used for comparison
            $fromCommit = $compareCommit
            $summary = Get-CommitsSummary -FromCommit $fromCommit -ToCommit $remoteCommit
            
            # Create changelog URL using published tag
            $changelogUrl = "https://github.com/LeGeRyChEeSe/Sunshine-AIO/compare/$($fromCommit.Substring(0, 7))...$($remoteCommit.Substring(0, 7))"
            
            $userWantsUpdate = Show-UpdateDialog -CurrentVersion $currentVersion -RemoteVersion $remoteVersion -Summary $summary -ChangelogUrl $changelogUrl
            
            
            if ($userWantsUpdate) {
                Write-Log "User accepted the update"
                
                # Check for local changes AFTER user accepts update
                if (Check-LocalChanges) {
                    Write-Log "Local changes detected, asking user what to do" "WARN"
                    $changesHandled = Handle-LocalChanges
                    if (-not $changesHandled) {
                        Write-Log "Update cancelled due to unhandled local changes" "WARN"
                        return $false
                    }
                }
                
                return Simulate-Update
            } else {
                Write-Log "User declined the update - NO changes check should happen"
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

# Main test function
function Start-UpdateTest {
    try {
        Write-Host "=== SUNSHINE-AIO AUTO-UPDATE TEST v$script:ScriptVersion ===" -ForegroundColor Yellow
        Write-Host "This is a test version that simulates the update process" -ForegroundColor Yellow
        Write-Host "=====================================================" -ForegroundColor Yellow
        
        if (-not (Test-Path ".git")) {
            Write-Log "Not in a git repository. Cloning test repository..." "INFO"
            git clone $TestRepo test-sunshine-aio
            Set-Location test-sunshine-aio
        }
        
        $updatePerformed = Check-ForUpdates
        
        if ($updatePerformed) {
            Write-Log "Test completed: Update simulation performed" "SUCCESS"
        } else {
            Write-Log "Test completed: No update needed or declined" "INFO"
        }
        
        Write-Host "`nTest log available at: $script:LogFile" -ForegroundColor Gray
        
    } catch {
        Write-Log "Test failed: $_" "ERROR"
        Write-Host "`nTest failed!`nError: $_" -ForegroundColor Red
    } finally {
        Write-Progress -Activity $script:ProgressActivity -Completed
    }
}

# Initialize log file
"" | Out-File -FilePath $script:LogFile -Force

# Start test
Start-UpdateTest