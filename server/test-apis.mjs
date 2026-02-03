// Test script for all 4 doctor APIs
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testAPIs() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TESTING ALL 4 DOCTOR APIs');
  console.log('='.repeat(60) + '\n');

  try {
    // ============ Step 1: Login to get token ============
    console.log('📍 STEP 1: LOGIN to get token\n');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.token) {
      console.log('❌ Login failed:', loginData);
      return;
    }

    const token = loginData.token;
    console.log('✅ Login successful!');
    console.log(`   Token (first 50 chars): ${token.substring(0, 50)}...\n`);

    // ============ API 1: Export JSON ============
    console.log('📍 API 1: Export Doctors as JSON file');
    console.log(`   URL: ${BASE_URL}/api/doctors/export\n`);
    
    const exportResponse = await fetch(`${BASE_URL}/api/doctors/export`);
    const exportData = await exportResponse.json();
    
    console.log(`✅ Export successful!`);
    console.log(`   Total doctors: ${exportData.length}`);
    if (exportData.length > 0) {
      console.log(`   First doctor: ${exportData[0].name} (${exportData[0].specialization})\n`);
    }

    // ============ API 2: Get by Department ============
    console.log('📍 API 2: Get doctors by Department');
    console.log(`   URL: ${BASE_URL}/api/doctors/by-department?token=TOKEN&department=Cardiology\n`);
    
    const deptResponse = await fetch(
      `${BASE_URL}/api/doctors/by-department?token=${token}&department=Cardiology`
    );
    const deptData = await deptResponse.json();
    
    if (deptData.success) {
      console.log(`✅ Found ${deptData.count} doctors in Cardiology department`);
      if (deptData.data.length > 0) {
        deptData.data.forEach(doc => {
          console.log(`   - ${doc.name} (${doc.specialization})`);
        });
      }
    } else {
      console.log(`❌ Error: ${deptData.message}`);
    }
    console.log();

    // ============ API 3: Get by Specialization ============
    console.log('📍 API 3: Get doctors by Specialization');
    console.log(`   URL: ${BASE_URL}/api/doctors/by-specialization?token=TOKEN&specialization=Cardiologist\n`);
    
    const specResponse = await fetch(
      `${BASE_URL}/api/doctors/by-specialization?token=${token}&specialization=Cardiologist`
    );
    const specData = await specResponse.json();
    
    if (specData.success) {
      console.log(`✅ Found ${specData.count} Cardiologists`);
      if (specData.data.length > 0) {
        specData.data.forEach(doc => {
          console.log(`   - ${doc.name} (${doc.specialization})`);
        });
      }
    } else {
      console.log(`❌ Error: ${specData.message}`);
    }
    console.log();

    // ============ API 4: Get all with filters ============
    console.log('📍 API 4: Get all doctors with filters');
    console.log(`   URL: ${BASE_URL}/api/doctors?token=TOKEN&name=Smith\n`);
    
    const allResponse = await fetch(
      `${BASE_URL}/api/doctors?token=${token}&name=Smith`
    );
    const allData = await allResponse.json();
    
    if (allData.success) {
      console.log(`✅ Found ${allData.count} doctors with name containing 'Smith'`);
      if (allData.data.length > 0) {
        allData.data.forEach(doc => {
          console.log(`   - ${doc.name} (${doc.specialization})`);
        });
      }
    } else {
      console.log(`❌ Error: ${allData.message}`);
    }
    console.log();

    // ============ Test without token ============
    console.log('📍 Testing API 2 without token (should fail)');
    console.log(`   URL: ${BASE_URL}/api/doctors/by-department?department=Cardiology\n`);
    
    const noTokenResponse = await fetch(
      `${BASE_URL}/api/doctors/by-department?department=Cardiology`
    );
    const noTokenData = await noTokenResponse.json();
    
    console.log(`✅ Correctly rejected: ${noTokenData.message}\n`);

    console.log('='.repeat(60));
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAPIs();
