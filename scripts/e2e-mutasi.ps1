# E2E Mutasi script
# Usage: Update $AsetIdString then run in PowerShell (Windows) with backend running on localhost:4000
# This script follows panduan/PANDUAN-MUTASI-E2E.md

param(
  [string]$AsetIdString = "0001/MLG-NET/2025",
  [int]$DepartemenTujuan = 3,
  [string]$RuanganTujuan = "Ruang Baru",
  [string]$Username = "admin",
  [string]$Role = "admin",
  [string]$BaseUrl = "http://localhost:4000"
)

Write-Host "Looking up numeric aset id for AsetId="$AsetIdString -ForegroundColor Cyan
$lookupUrl = "$BaseUrl/aset?AsetId=$([uri]::EscapeDataString($AsetIdString))"
$headers = @{ 'Accept' = 'application/json'; 'x-username' = $Username; 'x-role' = $Role }

$resp = Invoke-RestMethod -Uri $lookupUrl -Method Get -Headers $headers -ErrorAction Stop
if ($null -eq $resp) { Write-Error "No response from aset lookup"; exit 1 }
# If response is array, take first match
if ($resp -is [System.Array]) { $asetObj = $resp[0] } else { $asetObj = $resp }
if ($null -eq $asetObj) { Write-Error "Asset not found"; exit 1 }
$numericId = $asetObj.id -or $asetObj.ID -or $asetObj.asetId
Write-Host "Resolved aset: id='$($asetObj.id)' AsetId='$($asetObj.AsetId)'" -ForegroundColor Green

# Create mutasi
$createUrl = "$BaseUrl/mutasi"
$mutasiPayload = @{
  aset_id = $numericId
  TglMutasi = (Get-Date).ToString('yyyy-MM-dd')
  departemen_asal_id = $asetObj.departemen_id
  departemen_tujuan_id = $DepartemenTujuan
  ruangan_asal = $asetObj.Lokasi
  ruangan_tujuan = $RuanganTujuan
  alasan = "E2E test"
  catatan = "e2e-script"
} | ConvertTo-Json -Depth 6

Write-Host "Creating mutasi..." -ForegroundColor Cyan
$createResp = Invoke-RestMethod -Uri $createUrl -Method Post -Headers @{ 'Content-Type' = 'application/json'; 'x-username' = $Username; 'x-role' = $Role } -Body $mutasiPayload -ErrorAction Stop
Write-Host "Create response:" (ConvertTo-Json $createResp -Depth 6) -ForegroundColor Green
$mutasiId = $createResp.id -or $createResp.ID -or $createResp.mutasi_id
if (-not $mutasiId) { Write-Warning "Could not determine mutasi id from response" }

# Approve mutasi (if approval endpoint exists)
if ($mutasiId) {
  $approveUrl = "$BaseUrl/approval/mutasi/$mutasiId/approve"
  Write-Host "Approving mutasi id=$mutasiId..." -ForegroundColor Cyan
  try {
    $approveResp = Invoke-RestMethod -Uri $approveUrl -Method Post -Headers @{ 'Content-Type' = 'application/json'; 'x-username' = $Username; 'x-role' = $Role } -Body '{}' -ErrorAction Stop
    Write-Host "Approve response:" (ConvertTo-Json $approveResp -Depth 6) -ForegroundColor Green
  } catch {
    Write-Warning "Approve failed: $_"
  }
}

# Verify asset updated
Write-Host "Verifying asset..." -ForegroundColor Cyan
$verify = Invoke-RestMethod -Uri $lookupUrl -Method Get -Headers $headers -ErrorAction Stop
Write-Host "Asset after approve:" (ConvertTo-Json $verify -Depth 6) -ForegroundColor Green

# Check riwayat
if ($mutasiId) {
  $riwayatUrl = "$BaseUrl/riwayat?tabel_ref=mutasi&record_id=$mutasiId"
  Write-Host "Fetching riwayat for mutasi..." -ForegroundColor Cyan
  try {
    $r = Invoke-RestMethod -Uri $riwayatUrl -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "Riwayat:" (ConvertTo-Json $r -Depth 6) -ForegroundColor Green
  } catch {
    Write-Warning "Failed to fetch riwayat: $_"
  }
}

Write-Host "E2E script finished." -ForegroundColor Cyan
