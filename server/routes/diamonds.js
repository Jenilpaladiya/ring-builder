// server/routes/diamonds.js
import fs from "node:fs/promises";
import path from "node:path";

export async function diamondsRoute(req, res) {
  try {
    const filePath = path.join(process.cwd(), "data", "diamonds.normalized.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const diamonds = JSON.parse(raw);
    res.json(diamonds); // ✅ return array
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load diamonds" });
  }
}
