const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountPath = path.join(__dirname, "..", "serviceAccountKey.json");
if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ Missing server/serviceAccountKey.json");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});

const db = admin.firestore();

async function deleteCollection(collName) {
  const snap = await db.collection(collName).get();
  if (snap.empty) {
    console.log(`ℹ️ ${collName}: nothing to delete`);
    return;
  }
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  console.log(`🗑️ Deleted ${snap.size} docs from ${collName}`);
}

async function seedRingSettings() {
  const jsonPath = path.join(__dirname, "..", "data", "ringSettings.json");
  if (!fs.existsSync(jsonPath)) {
    console.error("❌ Missing server/data/ringSettings.json");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const entries = Object.entries(data);

  console.log("🧩 Seeding ringSettings docs:", entries.length);

  for (const [docId, docData] of entries) {
    await db.collection("ringSettings").doc(docId).set(docData, { merge: false });
    console.log("✅ Seeded:", docId);
  }

  console.log("🎉 Done.");
}

(async () => {
  try {
    await deleteCollection("ringSettings");     // ✅ removes old 5
    await seedRingSettings();                  // ✅ adds new 10
    process.exit(0);
  } catch (e) {
    console.error("❌ Failed:", e);
    process.exit(1);
  }
})();
