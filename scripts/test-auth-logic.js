const bcrypt = require("bcryptjs");

async function testBcrypt() {
  const plainPassword = "HunterPassword123";
  console.log("🔐 Testing bcrypt hashing and verification logic...");

  const hash = await bcrypt.hash(plainPassword, 10);
  console.log("✅ Hash generated:", hash.substring(0, 25) + "...");

  const match = await bcrypt.compare(plainPassword, hash);
  console.log("✅ Correct password verification:", match ? "PASSED (true)" : "FAILED (false)");

  const wrongMatch = await bcrypt.compare("WrongPassword!", hash);
  console.log("✅ Wrong password rejection:", !wrongMatch ? "PASSED (rejected)" : "FAILED (accepted)");

  if (match && !wrongMatch) {
    console.log("🎉 Bcrypt authentication logic verified successfully!");
    process.exit(0);
  } else {
    console.error("❌ Bcrypt verification failed!");
    process.exit(1);
  }
}

testBcrypt();
