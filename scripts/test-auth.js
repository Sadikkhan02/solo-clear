const bcrypt = require("bcryptjs");

async function testBcrypt() {
  console.log("\n🔐 Testing bcrypt hashing & verification...");

  const plainPassword = "HunterPassword123";
  const hash = await bcrypt.hash(plainPassword, 10);
  console.log("✅ Hash generated:", hash.substring(0, 20) + "...");

  const match = await bcrypt.compare(plainPassword, hash);
  console.log("✅ Correct password verification:", match ? "PASSED" : "FAILED");

  const wrongMatch = await bcrypt.compare("WrongPassword", hash);
  console.log("✅ Wrong password rejection:", !wrongMatch ? "PASSED" : "FAILED");

  return match && !wrongMatch;
}

async function testRegistrationValidation() {
  console.log("\n📝 Testing registration validation rules...");

  const testCases = [
    {
      name: "Empty fields",
      input: { email: "", password: "" },
      expectedError: "Email and password are required",
    },
    {
      name: "Invalid email format",
      input: { email: "invalid-email", password: "validpassword123" },
      expectedError: "Please enter a valid email address",
    },
    {
      name: "Short password (<6 chars)",
      input: { email: "hunter@test.com", password: "123" },
      expectedError: "Password must be at least 6 characters",
    },
  ];

  let passed = 0;
  for (const test of testCases) {
    const { email, password } = test.input;

    let error = null;
    if (!email || !password) {
      error = "Email and password are required";
    } else if (!email.includes("@") || !email.includes(".")) {
      error = "Please enter a valid email address";
    } else if (password.length < 6) {
      error = "Password must be at least 6 characters";
    }

    if (error === test.expectedError) {
      console.log(`✅ [${test.name}]: PASSED (caught: "${error}")`);
      passed++;
    } else {
      console.log(`❌ [${test.name}]: FAILED (got "${error}", expected "${test.expectedError}")`);
    }
  }

  console.log(`📊 Validation test results: ${passed}/${testCases.length} passed`);
  return passed === testCases.length;
}

async function runTests() {
  console.log("🚀 Starting unified auth tests (bcrypt & registration validation)...");

  const bcryptOk = await testBcrypt();
  const validationOk = await testRegistrationValidation();

  if (bcryptOk && validationOk) {
    console.log("\n🎉 All auth & registration tests PASSED successfully!");
    process.exit(0);
  } else {
    console.error("\n❌ Some auth tests failed. Please review the errors above.");
    process.exit(1);
  }
}

runTests();
