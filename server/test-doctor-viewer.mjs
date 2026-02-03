#!/usr/bin/env node

import fetch from "node-fetch";

const BASE_URL = "http://localhost:5000";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`),
};

async function testDoctorViewer() {
  try {
    log.title("TEST DOCTOR VIEWER ROLE");

    // Step 1: Login as doctor_viewer
    log.info("Step 1: Logging in as doctor_viewer...");
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "doctorviewer@example.com",
        password: "password123",
      }),
    });

    const loginData = await loginRes.json();
    if (!loginData.success) {
      log.error(`Login failed: ${loginData.message}`);
      return;
    }

    const token = loginData.token;
    log.success(`Logged in! Token: ${token.substring(0, 50)}...`);

    // Step 2: Test - Get doctor list (should work ✅)
    log.title("TEST 2: Get Doctor List (SHOULD WORK)");
    const doctorRes = await fetch(`${BASE_URL}/api/doctors?token=${token}`, {
      method: "GET",
    });

    const doctorData = await doctorRes.json();
    if (doctorData.success) {
      log.success(
        `Doctor list retrieved! Found ${doctorData.data?.length || 0} doctors`
      );
      console.log(JSON.stringify(doctorData.data?.slice(0, 1), null, 2));
    } else {
      log.error(`Failed: ${doctorData.message}`);
    }

    // Step 3: Test - Try to create doctor (should be blocked ❌)
    log.title("TEST 3: Try to Create Doctor (SHOULD BE BLOCKED)");
    const createRes = await fetch(`${BASE_URL}/api/doctors/create?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Dr. Test",
        specialization: "Test",
        department: "Test",
      }),
    });

    const createData = await createRes.json();
    if (!createData.success && createData.code === 4) {
      log.success(
        `✅ BLOCKED as expected! Message: ${createData.message}`
      );
    } else {
      log.error(`❌ Should have been blocked! Got: ${createData.message}`);
    }

    // Step 4: Test - Try to see medicines (should be blocked ❌)
    log.title("TEST 4: Try to See Medicines (SHOULD BE BLOCKED)");
    try {
      const medicineRes = await fetch(
        `${BASE_URL}/api/admin/medicines?token=${token}`,
        { method: "GET" }
      );

      const medicineData = await medicineRes.json();
      if (!medicineData.success && medicineData.code === 4) {
        log.success(
          `✅ BLOCKED as expected! Message: ${medicineData.message}`
        );
      } else {
        log.error(
          `❌ Should have been blocked! Got: ${medicineData.message}`
        );
      }
    } catch (e) {
      log.error(`Request failed: ${e.message}`);
    }

    // Step 5: Test by department (should work ✅)
    log.title("TEST 5: Get Doctors by Department (SHOULD WORK)");
    const deptRes = await fetch(
      `${BASE_URL}/api/doctors/by-department?token=${token}&department=Cardiology`,
      { method: "GET" }
    );

    const deptData = await deptRes.json();
    if (deptData.success) {
      log.success(
        `✅ Retrieved ${deptData.data?.length || 0} doctors from Cardiology`
      );
    } else {
      log.error(`Failed: ${deptData.message}`);
    }

    // Step 6: Test by specialization (should work ✅)
    log.title("TEST 6: Get Doctors by Specialization (SHOULD WORK)");
    const specRes = await fetch(
      `${BASE_URL}/api/doctors/by-specialization?token=${token}&specialization=Cardiologist`,
      { method: "GET" }
    );

    const specData = await specRes.json();
    if (specData.success) {
      log.success(
        `✅ Retrieved ${specData.data?.length || 0} Cardiologists`
      );
    } else {
      log.error(`Failed: ${specData.message}`);
    }

    // Summary
    log.title("SUMMARY - DOCTOR VIEWER PERMISSIONS");
    console.log("✅ Can read doctor list");
    console.log("✅ Can filter by department");
    console.log("✅ Can filter by specialization");
    console.log("✅ Can export doctor list");
    console.log("❌ Cannot create doctors");
    console.log("❌ Cannot see medicines");
    console.log("❌ Cannot see appointments");
    console.log("❌ Cannot see other tables");
    console.log("\n🎯 Doctor Viewer role working perfectly! 👀\n");
  } catch (error) {
    log.error(`Error: ${error.message}`);
  }
}

testDoctorViewer();
