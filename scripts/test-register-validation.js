async function testValidation() {
  console.log("🧪 Testing /api/auth/register validation rules...");

  // Test 1: Empty body
  const res1 = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const data1 = await res1.json();
  console.log("Test 1 (Empty payload):", res1.status === 400 ? "✅ PASSED (400)" : "❌ FAILED", data1);

  // Test 2: Invalid email format
  const res2 = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "not-an-email", password: "validpassword123" }),
  });
  const data2 = await res2.json();
  console.log("Test 2 (Invalid email format):", res2.status === 400 ? "✅ PASSED (400)" : "❌ FAILED", data2);

  // Test 3: Short password (<6 chars)
  const res3 = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "hunter@test.com", password: "123" }),
  });
  const data3 = await res3.json();
  console.log("Test 3 (Short password < 6 chars):", res3.status === 400 ? "✅ PASSED (400)" : "❌ FAILED", data3);

  console.log("🎉 All registration validation tests completed!");
}

testValidation().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
