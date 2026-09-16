$ErrorActionPreference = "Stop"
$projectPath = "C:\Users\ASUS\Desktop\อบรมai\ทำแอป\Vss"
cd $projectPath

# 1. Backup Database
$backupFolder = "$projectPath\backups"
if (-not (Test-Path $backupFolder)) {
    New-Item -ItemType Directory -Path $backupFolder | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$dbPath = "$projectPath\prisma\dev.db"
$dbBackupPath = "$backupFolder\dev_$timestamp.db"

if (Test-Path $dbPath) {
    Copy-Item -Path $dbPath -Destination $dbBackupPath -Force
    Write-Host "Database backed up to: $dbBackupPath"
}

# 2. Push to GitHub
$gitPath = "C:\Program Files\Git\cmd\git.exe"
$commitMsg = "Auto backup UI and Database: $timestamp"

& $gitPath add .
& $gitPath commit -m $commitMsg
& $gitPath push origin main

Write-Host "Code and DB successfully pushed to GitHub."
