import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { admin, db } from "./firebaseAdmin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.join(__dirname, "seedData.json");

function readSeed() {
  if (!fs.existsSync(seedPath)) {
    throw new Error(`seedData.json not found at: ${seedPath}`);
  }
  return JSON.parse(fs.readFileSync(seedPath, "utf8"));
}

async function seedCollection(collectionName, items) {
  if (!Array.isArray(items) || items.length === 0) {
    console.log(`⚠️ Skipping ${collectionName}: no items`);
    return;
  }

  console.log(`➡️ Seeding ${collectionName}: ${items.length} docs`);

  // Firestore batch limit is 500 writes. We'll chunk at 400 safely.
  const CHUNK = 400;

  for (let i = 0; i < items.length; i += CHUNK) {
    const chunk = items.slice(i, i + CHUNK);
    const batch = db.batch();

    for (const item of chunk) {
      if (!item.id) throw new Error(`Missing id in ${collectionName} item: ${JSON.stringify(item)}`);

      const { id, ...data } = item;

      batch.set(
        db.collection(collectionName).doc(id),
        {
          ...data,
          seededAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true } // safe: updates existing docs
      );
    }

    await batch.commit();
    console.log(`✅ ${collectionName}: committed ${chunk.length} docs`);
  }
}

async function run() {
  try {
    const seed = readSeed();

    await seedCollection("metals", seed.metals);
    await seedCollection("ringSettings", seed.ringSettings);
    await seedCollection("diamonds", seed.diamonds);

    console.log("🎉 Firestore seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

run();
