const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

async function testEndpoint(path, expectedStatuses, description) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, { redirect: "manual" });
    const status = res.status;
    const passed = expectedStatuses.includes(status);
    console.log(
      `${passed ? "✅" : "❌"} ${description}`,
      `(Expected: [${expectedStatuses.join(", ")}], Got: ${status})`
    );
    return { passed, path, status };
  } catch (err) {
    console.log(`❌ ${description} - ERROR:`, err.message);
    return { passed: false, path, error: err.message };
  }
}

async function runTests() {
  console.log("🧪 Starting Edge Middleware Route Protection Tests...\n");
  console.log(`Target URL: ${BASE_URL}\n`);

  const tests = [
    {
      path: "/",
      expectedStatuses: [302, 307],
      description: "Protected route / should redirect unauthenticated users to /login",
    },
    {
      path: "/status",
      expectedStatuses: [302, 307],
      description: "Protected route /status should redirect unauthenticated users to /login",
    },
    {
      path: "/login",
      expectedStatuses: [200],
      description: "Public route /login should be accessible directly",
    },
    {
      path: "/register",
      expectedStatuses: [200],
      description: "Public route /register should be accessible directly",
    },
    {
      path: "/api/auth/providers",
      expectedStatuses: [200],
      description: "Public API /api/auth/providers should be accessible directly",
    },
  ];

  const results = [];
  for (const test of tests) {
    const result = await testEndpoint(test.path, test.expectedStatuses, test.description);
    results.push(result);
  }

  console.log("\n📊 Test Summary:");
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`✅ ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log("\n🚀 All tests passed! Edge middleware is protecting routes correctly.");
    process.exit(0);
  } else {
    console.error("\n❌ Some middleware tests failed. Please review the configuration.");
    process.exit(1);
  }
}

runTests();
