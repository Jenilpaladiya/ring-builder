import fs from "fs";
import path from "path";
import admin from "firebase-admin";

const serviceAccountPath = path.resolve("serviceAccountKey.json");
const jsonPath = path.resolve("data/ringSettings.json");

// Init Admin
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"))),
});

const db = admin.firestore();

function normalizeSetting(s) {
  // OPTIONAL but recommended if your Step2 logic uses lowercase shapes
  // return { ...s, compatibleShapes: (s.compatibleShapes || []).map(x => String(x).trim().toLowerCase()) };

  return s; // keep as-is (Round/Oval/etc)
}

async function main() {
  const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  const entries = Object.entries(raw);
  if (!entries.length) {
    console.log("No settings found in JSON.");
    return;
  }

  const batch = db.batch();
  for (const [docId, data] of entries) {
    const ref = db.collection("ringSettings").doc(docId);
    batch.set(ref, normalizeSetting(data), { merge: true });
  }

  await batch.commit();
  console.log(`✅ Seeded ${entries.length} ring settings into ringSettings collection`);
}

main().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});