# Sunshine-AIO Installation Script
# Enhanced with better error handling, UI improvements, and robust Python detection

param(
    [string]$InstallPath = ""
)

# Set strict mode for better error detection
Set-StrictMode -Version Latest

# Initialize global variables
$script:LogFile = Join-Path $env:TEMP "sunshine-aio-install.log"
$script:ProgressActivity = "Installing Sunshine-AIO"
$script:ScriptUrl = "https://sunshine-aio.com/script.ps1"

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

function Test-InternetConnection {
    try {
        $null = Test-NetConnection -ComputerName "8.8.8.8" -Port 53 -InformationLevel Quiet -WarningAction SilentlyContinue
        return $true
    } catch {
        return $false
    }
}

function Get-UserInstallPath {
    if ($InstallPath -ne "") {
        $selectedPath = $InstallPath
    } else {
        Write-Host "`nInstallation Directory Selection" -ForegroundColor Magenta
        Write-Host "By default, Sunshine-AIO will be installed in: $env:USERPROFILE\Sunshine-AIO"
        $response = Read-Host "Would you like to use a different directory? (y/N)"
        
        if ($response -match '^[yY]') {
            do {
                $selectedPath = Read-Host "Enter the full path of the parent directory"
                $selectedPath = $selectedPath.Trim('"').Trim()
                
                if (-not $selectedPath) {
                    $selectedPath = $env:USERPROFILE
                    break
                }
                
                if (-not (Test-Path $selectedPath)) {
                    Write-Log "The path '$selectedPath' does not exist." "WARN"
                    $create = Read-Host "Would you like to create it? (y/N)"
                    if ($create -match '^[yY]') {
                        try {
                            New-Item -ItemType Directory -Path $selectedPath -Force | Out-Null
                            Write-Log "Directory created: $selectedPath" "SUCCESS"
                            break
                        } catch {
                            Write-Log "Unable to create directory: $_" "ERROR"
                        }
                    }
                } else {
                    break
                }
            } while ($true)
        } else {
            $selectedPath = $env:USERPROFILE
        }
    }
    
    return $selectedPath
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
        Write-Host "`nRunning from existing Sunshine-AIO directory" -ForegroundColor Green
        
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
            git fetch
            git checkout main
            git pull
            Write-Log "Repository updated successfully" "SUCCESS"
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
        
        # Create launcher batch file that calls the script from scripts folder
        $batContent = @"
@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "scripts\Sunshine-AIO.ps1"
pause
"@
        
        try {
            $batContent | Out-File -FilePath "Sunshine-AIO.bat" -Encoding ASCII -Force
            Write-Log "Launcher batch file created: Sunshine-AIO.bat" "SUCCESS"
        } catch {
            Write-Log "Warning: Could not create batch file: $_" "WARN"
        }
        
        Write-Log "Setup completed successfully!" "SUCCESS"
        
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
    param([string]$RootPath, [string]$PythonCommand)
    
    try {
        $sunshineAioPath = Join-Path -Path $RootPath -ChildPath "Sunshine-AIO"
        
        # Check if directory already exists
        if (Test-Path $sunshineAioPath) {
            Write-Log "Sunshine-AIO directory already exists. Updating..."
            Show-Progress "Updating existing installation..." 80
            
            Set-Location $sunshineAioPath
            git fetch
            git checkout main
            git pull
        } else {
            Write-Log "Cloning Sunshine-AIO repository..."
            Show-Progress "Cloning repository..." 75
            
            Set-Location $RootPath
            git clone https://github.com/LeGeRyChEeSe/Sunshine-AIO.git
            Set-Location $sunshineAioPath
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
        
        # Create launcher batch file that calls the script from scripts folder
        $batContent = @"
@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "scripts\Sunshine-AIO.ps1"
pause
"@
        
        try {
            $batPath = Join-Path -Path $sunshineAioPath -ChildPath "Sunshine-AIO.bat"
            $batContent | Out-File -FilePath $batPath -Encoding ASCII -Force
            Write-Log "Launcher batch file created: Sunshine-AIO.bat" "SUCCESS"
        } catch {
            Write-Log "Warning: Could not create batch file: $_" "WARN"
        }
        
        Write-Log "Installation completed successfully!" "SUCCESS"
        Show-Progress "Installation completed" 95
        
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
        Write-Host "Sunshine-AIO Installer" -ForegroundColor Yellow
        Write-Host "======================" -ForegroundColor Yellow
        Write-Log "Starting Sunshine-AIO installation process..."
        
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
        
        # Get installation path
        $installPath = Get-UserInstallPath
        Write-Log "Installation directory: $installPath"
        
        # Install Sunshine-AIO
        Install-SunshineAIO -RootPath $installPath -PythonCommand $pythonCommand
        
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