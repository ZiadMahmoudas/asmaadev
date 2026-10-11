$ErrorActionPreference = "Stop"
$base = "https://ramz-tashyeed.web.app/assets/clients"
$names = @("ghartaf","zaity","shamandar","ubayyah","parma","ajaya","mshaqqar","sempre","jadeer","marsha","umami","saba","wajbat-alqarya","tinh")
$dest = Join-Path $PSScriptRoot "assets\clients"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
foreach ($n in $names) {
  $url = "$base/$n.png"
  $file = Join-Path $dest "$n.png"
  Write-Host "Downloading $url"
  Invoke-WebRequest -Uri $url -OutFile $file -UseBasicParsing
}
Write-Host "Done. Original client logos are stored in assets\clients."
