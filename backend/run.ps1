$envFile = Join-Path $PSScriptRoot ".env"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#=]+)\s*=\s*(.*)\s*$') {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2])
        }
    }
} else {
    Write-Warning ".env introuvable dans $PSScriptRoot — les valeurs par defaut de application.yml seront utilisees."
}

& "$PSScriptRoot\mvnw.cmd" spring-boot:run
