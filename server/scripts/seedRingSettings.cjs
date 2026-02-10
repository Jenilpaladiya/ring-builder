const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountPath = path.join(__dirname, "..", "serviceAccountKey.json");
if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ Missing server/serviceAccountKey.json");
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function main() {
  const jsonPath = path.join(__dirname, "..", "data", "ringSettings.json");
  if (!fs.existsSync(jsonPath)) {
    console.error("❌ Missing server/data/ringSettings.json");
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, "utf8");
  const data = JSON.parse(raw);

  const entries = Object.entries(data);
  console.log("🧩 ringSettings docs to seed:", entries.length);

  for (const [docId, docData] of entries) {
    await db.collection("ringSettings").doc(docId).set(docData, { merge: true });
    console.log("✅ Upserted:", docId);
  }

  console.log("🎉 Done. Seeded:", entries.length);
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
