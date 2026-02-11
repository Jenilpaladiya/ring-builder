const fs = require("fs");
const path = require("path");

const admin = require("firebase-admin");

// ✅ IMPORTANT: make sure this points to your correct service account file
const serviceAccount = require("../server/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function main() {
  const filePath = path.join(__dirname, "..", "data", "ringSettings.seed.json");
  const raw = fs.readFileSync(filePath, "utf8");
  const seedObj = JSON.parse(raw);

  console.log("Seeding project:", serviceAccount.project_id);
  console.log("Items:", Object.keys(seedObj).length);

  const batch = db.batch();
  for (const [docId, data] of Object.entries(seedObj)) {
    const ref = db.collection("ringSettings").doc(docId);
    batch.set(ref, data, { merge: true });
  }

  await batch.commit();
  console.log("✅ Seeded ringSettings successfully.");
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
