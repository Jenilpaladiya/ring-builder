import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, ".."); // project root

const FILES = [
  path.join(ROOT, "client", "data", "diamonds.json"),
  path.join(ROOT, "server", "data", "diamonds.normalized.json"), // if exists
];

const MAP = {
  round: "/images/diamonds/round.jpg",
  oval: "/images/diamonds/oval.jpeg",
  pear: "/images/diamonds/pear.jpg",
  emerald: "/images/diamonds/emerald.jpg",
  princess: "/images/diamonds/princess.jpg",
  cushion: "/images/diamonds/cushion.jpeg",
  radiant: "/images/diamonds/radiant.jpg",
  marquise: "/images/diamonds/marquise.jpg",
  heart: "/images/diamonds/heart.jpg",
  asscher: "/images/diamonds/asscher.jpeg",
};

function shapeKey(shape = "") {
  const s = shape.toLowerCase();
  if (s.includes("round")) return "round";
  if (s.includes("oval")) return "oval";
  if (s.includes("pear")) return "pear";
  if (s.includes("emerald")) return "emerald";
  if (s.includes("princess")) return "princess";
  if (s.includes("cushion")) return "cushion";
  if (s.includes("radiant")) return "radiant";
  if (s.includes("marquise")) return "marquise";
  if (s.includes("heart")) return "heart";
  if (s.includes("asscher")) return "asscher";
  return "round";
}

for (const file of FILES) {
  if (!fs.existsSync(file)) {
    console.log(`⏭️ Skip (not found): ${file}`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const arr = Array.isArray(data) ? data : Object.values(data);

  const updated = arr.map((d) => ({
    ...d,
    imageUrl: MAP[shapeKey(d.shape)],
  }));

  fs.writeFileSync(file, JSON.stringify(updated, null, 2));
  console.log(`✅ Updated: ${file}`);
}
