async function testUserRoutes() {
  console.log("🧪 Testing User Data API Routes (CRUD & Authorization)...");

  // Test 1: Unauthenticated GET /api/user -> should return 401
  const res1 = await fetch("http://localhost:3000/api/user");
  const data1 = await res1.json();
  console.log(
    "Test 1 (Unauthenticated GET /api/user):",
    res1.status === 401 ? "✅ PASSED (401 Unauthorized)" : `❌ FAILED (${res1.status})`,
    data1
  );

  // Test 2: Unauthenticated PUT /api/user/progress -> should return 401
  const res2 = await fetch("http://localhost:3000/api/user/progress", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dailyProgress: { pushups: true } }),
  });
  const data2 = await res2.json();
  console.log(
    "Test 2 (Unauthenticated PUT /api/user/progress):",
    res2.status === 401 ? "✅ PASSED (401 Unauthorized)" : `❌ FAILED (${res2.status})`,
    data2
  );

  // Test 3: Unauthenticated POST /api/user/hunt/complete -> should return 401
  const res3 = await fetch("http://localhost:3000/api/user/hunt/complete", {
    method: "POST",
  });
  const data3 = await res3.json();
  console.log(
    "Test 3 (Unauthenticated POST /api/user/hunt/complete):",
    res3.status === 401 ? "✅ PASSED (401 Unauthorized)" : `❌ FAILED (${res3.status})`,
    data3
  );

  if (res1.status === 401 && res2.status === 401 && res3.status === 401) {
    console.log("🎉 All User Data API Route authorization tests PASSED!");
  } else {
    console.error("❌ Some user route tests failed.");
    process.exit(1);
  }
}

testUserRoutes().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
