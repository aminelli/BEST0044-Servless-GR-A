
$functionAppName = "best0044graapp01"
$suffix = "$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "Creating deployment package for Azure Function App: $($functionAppName) ...."

# Remove-Item -Path ".\node_modules" -Recurse -Force

npm run clean && npm run build

# $folderDeploy = "D:\Temp\CORSI\BEST0044-Servless-GR-A\Esercizi\NodeJs\ES002-Azure\deploy"
$folderDeploy = "deploy"
$folderDeployTemp = "$($folderDeploy)\deploy-$suffix"
New-Item -ItemType Directory -Path $folderDeployTemp

# Copia i file necessari per il deploy
Copy-Item -Path "dist\*" -Destination $folderDeployTemp -Recurse
# Copy-Item -Path "node_modules" -Destination $folderDeployTemp -Recurse
Copy-Item -Path "package.json" -Destination $folderDeployTemp
Copy-Item -Path "host.json" -Destination $folderDeployTemp

Set-Location $folderDeployTemp
npm install --production
Set-Location ..
Set-Location ..


# Crea Zip
$zipPath = "deploy\$($functionAppName)-$suffix.zip"
Compress-Archive -Path "$folderDeployTemp\*" -DestinationPath $zipPath -Force

az functionapp deployment source config-zip --resource-group "BEST0044-GR-A-Servless" --name $functionAppName --src $zipPath --build-remote true    

az functionapp deployment source config-zip --resource-group "BEST0044-GR-A-Servless" --name "best0044graapp01" --src "deploy\best0044graapp01-20260320-123240.zip" --build-remote true    
# Cleanup
# Remove-Item "$folderDeployTemp" -Recurse -Force

Write-Host "Deployment package created at: $zipPath ($('{0:N2}' -f ((Get-Item $zipPath).Length / 1MB)) MB)"


