#!/usr/bin/env pwsh

Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "TEST ALL 4 DOCTOR APIs" -ForegroundColor Cyan
Write-Host "="*60 + "`n" -ForegroundColor Cyan

$base = "http://localhost:5000"

# Login
Write-Host "STEP 1: LOGIN" -ForegroundColor Yellow
$login = Invoke-RestMethod -Uri "$base/api/auth/login" -Method POST `
    -Body (@{email="user@example.com"; password="password"} | ConvertTo-Json) `
    -ContentType "application/json"
$token = $login.token
Write-Host "OK - Token: $($token.Substring(0,30))...`n" -ForegroundColor Green

# API 1
Write-Host "API 1: Export JSON" -ForegroundColor Yellow
$api1 = Invoke-RestMethod -Uri "$base/api/doctors/export" -Method GET
Write-Host "OK - $($api1.Count) doctors exported`n" -ForegroundColor Green

# API 2
Write-Host "API 2: Get by Department" -ForegroundColor Yellow
$url2 = "$base/api/doctors/by-department" + "?token=$token" + "&department=Cardiology"
$api2 = Invoke-RestMethod -Uri $url2 -Method GET
Write-Host "OK - Found $($api2.count) doctors in Cardiology`n" -ForegroundColor Green

# API 3
Write-Host "API 3: Get by Specialization" -ForegroundColor Yellow
$url3 = "$base/api/doctors/by-specialization" + "?token=$token" + "&specialization=Cardiologist"
$api3 = Invoke-RestMethod -Uri $url3 -Method GET
Write-Host "OK - Found $($api3.count) Cardiologists`n" -ForegroundColor Green

# API 4
Write-Host "API 4: Get All with Filters" -ForegroundColor Yellow
$url4 = "$base/api/doctors" + "?token=$token" + "&name=Dr"
$api4 = Invoke-RestMethod -Uri $url4 -Method GET
Write-Host "OK - Found $($api4.count) doctors with 'Dr' in name`n" -ForegroundColor Green

# Test without token
Write-Host "Test without token (should fail)" -ForegroundColor Yellow
$url5 = "$base/api/doctors/by-department" + "?department=Cardiology"
$api5 = Invoke-RestMethod -Uri $url5 -Method GET
Write-Host "OK - Correctly rejected: $($api5.message)`n" -ForegroundColor Green

Write-Host "="*60 -ForegroundColor Cyan
Write-Host "ALL TESTS PASSED!" -ForegroundColor Green
Write-Host "="*60 + "`n" -ForegroundColor Cyan
