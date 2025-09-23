param(
  [Parameter(Mandatory=$true)][string]$Name,
  [string]$Id
)

if (-not $Id) {
  $timestamp = Get-Date -Format "yyyyMMddHHmmss"
  $Id = $timestamp
}

$featureDir = Join-Path -Path (Join-Path $PSScriptRoot "..\specs") -ChildPath "$Id-$Name"
New-Item -ItemType Directory -Path $featureDir -Force | Out-Null

Copy-Item (Join-Path $PSScriptRoot "..\templates\spec-template.md") (Join-Path $featureDir "spec.md") -Force
Copy-Item (Join-Path $PSScriptRoot "..\templates\plan-template.md") (Join-Path $featureDir "plan.md") -Force
Copy-Item (Join-Path $PSScriptRoot "..\templates\tasks-template.md") (Join-Path $featureDir "tasks.md") -Force

Write-Host "Created feature at $featureDir"
