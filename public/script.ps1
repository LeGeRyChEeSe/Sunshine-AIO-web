# Sets the execution policy for the current user to allow remote scripts to run
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

$url = "https://sunshine-aio.com/script.ps1"

# Function to check Python version and install if necessary
function CheckAndInstallPython {
    try {
        $pythonVersion = py --version 2>&1 | Select-String -Pattern "\d+\.\d+\.\d+" | ForEach-Object { $_.Matches[0].Value }
    } catch {
        Write-Warning "Check Python version failed."
    }

    # Python downloads page URL
    $urlPythonDownloads = "https://www.python.org/downloads/"

    # Download the page content
    $webPageContent = Invoke-WebRequest -Uri $urlPythonDownloads

    # Use a regular expression to find the version numbers
    $pythonVersions = $webPageContent.Content | Select-String -Pattern "Download Python (\d+\.\d+\.\d+)" -AllMatches

    # Extract the version numbers from the matches and sort them in descending order
    $latestPythonVersion = $pythonVersions | ForEach-Object { [Version]$_.Matches[0].Groups[1].Value } | Sort-Object -Descending | Select-Object -First 1

    # Download URL
    $urlPython = "https://www.python.org/ftp/python/$latestPythonVersion/python-$latestPythonVersion-amd64.exe"

    if ($null -eq $pythonVersion) {
        Write-Output "Python is not installed on the system. Installing the latest version..."
    } elseif ([Version]$pythonVersion -ne [Version]$latestPythonVersion) {
        Write-Output "Updating the Python version..."
    } else {
        Write-Output "Correct Python version: $pythonVersion"
        return
    }

    # Create a temporary directory to download and install Python
    $tempDir = New-Item -ItemType Directory -Path ([System.IO.Path]::GetTempPath() + "python-$(get-random).tmp") -Force
    $tempFile = Join-Path -Path $tempDir.FullName -ChildPath "python-$latestPythonVersion-amd64.exe"

    # Download Python
    Write-Output "Downloading version $latestPythonVersion of Python..."
    Invoke-WebRequest -Uri $urlPython -OutFile $tempFile

    # Run the installation script from the temporary directory
    Write-Output "Running the Python installation script..."
    Start-Process -FilePath $tempFile -ArgumentList "/quiet PrependPath=0 AddToPath=1 InstallUserPartitionKey=""" -Wait

    $pythonPath = ";C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Launcher"
    [Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";$pythonPath")

    # Delete the downloaded file from the temporary directory
    Remove-Item $tempFile -Force
    Write-Output "Python ${latestPythonVersion} installed."
}

# Call the function before proceeding
CheckAndInstallPython

function CheckAndInstallGit {
    # Checks if Git is installed
    if (-not (Get-Command -Name git -ErrorAction SilentlyContinue)) {
        Write-Output "Git is not installed. Installing Git..."

        # Retrieves the latest version of Git from the GitHub API
        $urlGitReleases = "https://api.github.com/repos/git-for-windows/git/releases/latest"
        $latestRelease = Invoke-RestMethod -Uri $urlGitReleases -Method Get -UseBasicParsing

        # Retrieves the download link for the 64-bit Git package
        $browserDownloadUrl = ($latestRelease | Select-Object -ExpandProperty assets) | Where-Object {$_.name -like "*64-bit*"} | Select-Object -ExpandProperty browser_download_url

        if ($null -ne $browserDownloadUrl) {
            # Creates a temporary directory to store the downloaded package
            $tempDir = New-Item -ItemType Directory -Path ([System.IO.Path]::GetTempPath() + "git-$(get-random).tmp") -Force

            # Downloads the 64-bit Git package
            Write-Output "Downloading Git..."
            Invoke-WebRequest -Uri $browserDownloadUrl[0] -OutFile (Join-Path -Path $tempDir.FullName -ChildPath "PortableGit.exe")

            # Runs the installation script from the temporary directory
            Write-Output "Running the Git installation script..."
            Start-Process -FilePath (Join-Path -Path $tempDir.FullName -ChildPath "PortableGit.exe") -ArgumentList "/quiet" -Wait

            # Checks if the installation was successful
            if ((Get-Command -Name git -ErrorAction SilentlyContinue)) {
                Write-Output "Git installation successful"
            } else {
                Write-Error "Error installing Git"
            }
        } else {
            Write-Error "No 64-bit version available"
        }
    }
}

CheckAndInstallGit
    # Check if the entered path is a directory and exists
$parentDirectory = Get-Item -Path .
if ($parentDirectory.Name -eq "Sunshine-AIO") {
    $parentDirectory.name
    $rootPath = $parentDirectory.Parent.FullName
    Set-Location "${rootPath}\Sunshine-AIO"
} else {
    # Check if the entered path is a directory and exists
    $rootPath = Read-Host "Enter the path where you want to create the 'Sunshine-AIO' directory"
    $rootPath = $rootPath.Trim('"')
    while (!(Test-Path -Path $rootPath) -or !(Get-Item -Path $rootPath).PSIsContainer) {
        $rootPath = Read-Host "Enter the path where you want to create the 'Sunshine-AIO' directory"
        $rootPath = $rootPath.Trim('"')
    }

    if ($rootPath.EndsWith("Sunshine-AIO")) {
        $rootPath = $rootPath.Substring(0, $rootPath.LastIndexOf('\'))
    }
    Set-Location $rootPath
}

# Check if the Sunshine-AIO folder already exists, if yes, do not download the repo, but proceed to version checks
if (Test-Path "${rootPath}\Sunshine-AIO") {
    # Sets the variable containing the path to the created directory
    $sunshineAioPath = Join-Path -Path $rootPath -ChildPath "Sunshine-AIO"
    Write-Output "Sunshine-AIO folder already exists."
    Set-Location $sunshineAioPath
    git fetch
    git checkout main
    git pull
    # Check if .venv virtualenv does not exist
    if (-not (Test-Path "${sunshineAioPath}\.venv")) {
        Write-Output "Virtual environment does not exist, creating it now..."
        py -m venv .venv
    }
    Write-Output "Installing the packages..."
    .\.venv\Scripts\Activate.ps1
    py -m pip install --upgrade pip
    pip install -r requirements.txt
    Set-Location "${sunshineAioPath}\src"
    py main.py
    Deactivate
    # Download the HTML page and save it as script.ps1 in the Sunshine-AIO folder
    $outputPath = Join-Path -Path $sunshineAioPath -ChildPath "Sunshine-AIO.ps1"

    # Use the Invoke-RestMethod cmdlet to retrieve the page content
    Invoke-RestMethod -Uri $url -OutFile $outputPath -Method Get -ContentType 'text/plain' -Headers @{
        Accept = 'text/plain'
    }
    exit
}

# Clone the repository
Write-Output "Cloning repository..."
git clone https://github.com/LeGeRyChEeSe/Sunshine-AIO.git

# Sets the variable containing the path to the created directory
$sunshineAioPath = Join-Path -Path $rootPath -ChildPath "Sunshine-AIO"

# Install the required packages
Write-Output "Installing the packages..."
Set-Location $sunshineAioPath
# Install the packages in a py virtual environment
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install --upgrade pip
pip install -r requirements.txt

# Create the tools folder if it doesn't exist
if (-not (Test-Path "${sunshineAioPath}\src\tools")) {
    Write-Output "Creating the tools folder..."
    New-Item -ItemType Directory -Path "${sunshineAioPath}\src\tools"
}

# Create a symlink to the tools folder
Write-Output "Creating a symlink to the tools folder..."
New-Item -ItemType Junction -Path "${sunshineAioPath}\tools" -Target "${sunshineAioPath}\src\tools"

# Run the program
Write-Output "Running the program..."
Set-Location "${sunshineAioPath}\src"
py main.py

# Deactivate the virtual environment
Deactivate

# Download the HTML page and save it as script.ps1 in the Sunshine-AIO folder
$outputPath = Join-Path -Path $sunshineAioPath -ChildPath "Sunshine-AIO.ps1"

# Use the Invoke-RestMethod cmdlet to retrieve the page content
Invoke-RestMethod -Uri $url -OutFile $outputPath -Method Get -ContentType 'text/plain' -Headers @{
    Accept = 'text/plain'
}

# Exit the script
exit
