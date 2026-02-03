# PowerShell test script for all 4 APIs

Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "🧪 TESTING ALL 4 DOCTOR APIs" -ForegroundColor Cyan
Write-Host "="*60 + "`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"

# Step 1: Login
Write-Host "📍 STEP 1: LOGIN" -ForegroundColor Yellow
Write-Host "URL: POST $baseUrl/api/auth/login`n" -ForegroundColor Gray

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST `
        -Body (ConvertTo-Json @{email="user@example.com"; password="password"}) `
        -ContentType "application/json"
    
    $token = $loginResponse.token
    Write-Host "✅ Login successful!`n" -ForegroundColor Green
    Write-Host "Token (first 50 chars): $($token.Substring(0, 50))...`n" -ForegroundColor Green
}
catch {
    Write-Host "❌ Login failed: $_`n" -ForegroundColor Red
    exit
}

# API 1: Export JSON
Write-Host "📍 API 1: Export Doctors as JSON file" -ForegroundColor Yellow
Write-Host "URL: GET $baseUrl/api/doctors/export`n" -ForegroundColor Gray

try {
    $export = Invoke-RestMethod -Uri "$baseUrl/api/doctors/export" -Method GET
    Write-Host "✅ Export successful!" -ForegroundColor Green
    Write-Host "Total doctors: $($export.Count)" -ForegroundColor Green
    if ($export.Count -gt 0) {
        Write-Host "First doctor: $($export[0].name) ($($export[0].specialization))`n" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Error: $_`n" -ForegroundColor Red
}

# API 2: Get by Department
Write-Host "📍 API 2: Get doctors by Department" -ForegroundColor Yellow
Write-Host "URL: GET $baseUrl/api/doctors/by-department?token=TOKEN&department=Cardiology`n" -ForegroundColor Gray

try {
    $url = "$baseUrl/api/doctors/by-department?token=$token&department=Cardiology"
    $deptResponse = Invoke-RestMethod -Uri $url -Method GET
    
    Write-Host "✅ Found $($deptResponse.count) doctors in Cardiology" -ForegroundColor Green
    if ($deptResponse.data.Count -gt 0) {
        foreach ($doctor in $deptResponse.data) {
            Write-Host "   - $($doctor.name) ($($doctor.specialization))" -ForegroundColor Green
        }
    }
    Write-Host ""
}
catch {
    Write-Host "❌ Error: $_`n" -ForegroundColor Red
}

# API 3: Get by Specialization
Write-Host "📍 API 3: Get doctors by Specialization" -ForegroundColor Yellow
Write-Host "URL: GET $baseUrl/api/doctors/by-specialization?token=TOKEN&specialization=Cardiologist`n" -ForegroundColor Gray

try {
    $url = "$baseUrl/api/doctors/by-specialization?token=$token&specialization=Cardiologist"
    $specResponse = Invoke-RestMethod -Uri $url -Method GET
    
    Write-Host "✅ Found $($specResponse.count) Cardiologists" -ForegroundColor Green
    if ($specResponse.data.Count -gt 0) {
        foreach ($doctor in $specResponse.data) {
            Write-Host "   - $($doctor.name) ($($doctor.specialization))" -ForegroundColor Green
        }
    }
    Write-Host ""
}
catch {
    Write-Host "❌ Error: $_`n" -ForegroundColor Red
}

# API 4: Get all with filters
Write-Host "📍 API 4: Get all doctors with filters" -ForegroundColor Yellow
Write-Host "URL: GET $baseUrl/api/doctors?token=TOKEN&name=Dr`n" -ForegroundColor Gray

try {
    $url = "$baseUrl/api/doctors?token=$token&name=Dr"
    $allResponse = Invoke-RestMethod -Uri $url -Method GET
    
    Write-Host "✅ Found $($allResponse.count) doctors with name containing 'Dr'" -ForegroundColor Green
    if ($allResponse.data.Count -gt 0) {
        foreach ($doctor in $allResponse.data | Select-Object -First 3) {
            Write-Host "   - $($doctor.name) ($($doctor.specialization))" -ForegroundColor Green
        }
        if ($allResponse.data.Count -gt 3) {
            Write-Host "   ... and $($allResponse.data.Count - 3) more" -ForegroundColor Green
        }
    }
    Write-Host ""
}
catch {
    Write-Host "❌ Error: $_`n" -ForegroundColor Red
}

# Test without token
Write-Host "📍 Testing API 2 without token (should fail)" -ForegroundColor Yellow
Write-Host "URL: GET $baseUrl/api/doctors/by-department?department=Cardiology`n" -ForegroundColor Gray

try {
    $url = "$baseUrl/api/doctors/by-department?department=Cardiology"
    $noTokenResponse = Invoke-RestMethod -Uri $url -Method GET
    Write-Host "✅ Correctly rejected: $($noTokenResponse.message)`n" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error (expected): $_`n" -ForegroundColor Yellow
}

Write-Host "="*60 -ForegroundColor Cyan
Write-Host "✅ ALL TESTS COMPLETED!" -ForegroundColor Green
Write-Host "="*60 + "`n" -ForegroundColor Cyan
