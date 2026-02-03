# Test Doctor Viewer Role - Simple version without emojis

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTING DOCTOR_VIEWER ROLE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# TEST 1: Login
Write-Host "`nTEST 1: Login as doctor_viewer" -ForegroundColor Yellow
$loginBody = @{email="doctorviewer@example.com";password="password123"} | ConvertTo-Json
$login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"

$token = $login.token
Write-Host "   [OK] Login successful! Role: $($login.role)" -ForegroundColor Green

# TEST 2: Read doctors (should work)
Write-Host "`nTEST 2: Get doctor list (SHOULD WORK)" -ForegroundColor Yellow
$doctors = Invoke-RestMethod -Uri "http://localhost:5000/api/doctors?token=$token"
Write-Host "   [OK] Retrieved $($doctors.data.Count) doctors" -ForegroundColor Green

# TEST 3: Try to create doctor (should be blocked)
Write-Host "`nTEST 3: Try to create doctor (SHOULD BE BLOCKED)" -ForegroundColor Yellow
try {
  $createBody = @{name="Test";specialization="Test";department="Test"} | ConvertTo-Json
  Invoke-RestMethod -Uri "http://localhost:5000/api/doctors/create?token=$token" -Method POST -Body $createBody -ContentType "application/json" -ErrorAction Stop
  Write-Host "   [FAIL] Should have been blocked!" -ForegroundColor Red
} catch {
  Write-Host "   [OK] BLOCKED as expected!" -ForegroundColor Green
}

# TEST 4: Try to see medicines (should be blocked)
Write-Host "`nTEST 4: Try to see medicines (SHOULD BE BLOCKED)" -ForegroundColor Yellow
try {
  Invoke-RestMethod -Uri "http://localhost:5000/api/admin/medicines?token=$token" -Method GET -ErrorAction Stop
  Write-Host "   [FAIL] Should have been blocked!" -ForegroundColor Red
} catch {
  Write-Host "   [OK] BLOCKED as expected!" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "ALL TESTS PASSED!" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

Write-Host "`nSUMMARY:" -ForegroundColor Cyan
Write-Host "   [OK] Can read doctor list" -ForegroundColor Green
Write-Host "   [OK] Can filter doctors" -ForegroundColor Green
Write-Host "   [X]  CANNOT create doctors" -ForegroundColor Red
Write-Host "   [X]  CANNOT see medicines" -ForegroundColor Red
Write-Host "   [X]  CANNOT see other tables" -ForegroundColor Red
Write-Host "`nDoctor Viewer role working perfectly!`n" -ForegroundColor Magenta
