import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";

const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = path.resolve("data/diamonds.normalized.json");

function loadDiamonds() {
  if (!fs.existsSync(DATA_PATH)) return [];
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

let DIAMONDS = loadDiamonds();

app.get("/api/diamonds", (req, res) => {
  const {
    q,
    shape,
    color,
    clarity,
    minCarat,
    maxCarat,
    minPrice,
    maxPrice,
    sort = "priceLow",
    limit = "60",
    offset = "0",
  } = req.query;

  let list = [...DIAMONDS];

  // search
  if (q) {
    const s = String(q).toLowerCase();
    list = list.filter((d) =>
      [d.id, d.shape, d.color, d.clarity, d.lab].some((x) =>
        String(x || "").toLowerCase().includes(s)
      )
    );
  }

  // filters
  if (shape && shape !== "All") list = list.filter((d) => d.shape === shape);
  if (color && color !== "All") list = list.filter((d) => d.color === color);
  if (clarity && clarity !== "All") list = list.filter((d) => d.clarity === clarity);

  const n = (v) => {
    const x = Number(v);
    return Number.isFinite(x) ? x : null;
  };

  const cMin = n(minCarat);
  const cMax = n(maxCarat);
  const pMin = n(minPrice);
  const pMax = n(maxPrice);

  if (cMin !== null) list = list.filter((d) => n(d.carat) !== null && n(d.carat) >= cMin);
  if (cMax !== null) list = list.filter((d) => n(d.carat) !== null && n(d.carat) <= cMax);
  if (pMin !== null) list = list.filter((d) => n(d.price) !== null && n(d.price) >= pMin);
  if (pMax !== null) list = list.filter((d) => n(d.price) !== null && n(d.price) <= pMax);

  // sort
  if (sort === "priceLow") list.sort((a, b) => (n(a.price) ?? 0) - (n(b.price) ?? 0));
  if (sort === "priceHigh") list.sort((a, b) => (n(b.price) ?? 0) - (n(a.price) ?? 0));
  if (sort === "caratHigh") list.sort((a, b) => (n(b.carat) ?? 0) - (n(a.carat) ?? 0));

  const off = Math.max(0, parseInt(offset, 10) || 0);
  const lim = Math.max(1, parseInt(limit, 10) || 60);

  res.json({
    count: list.length,
    results: list.slice(off, off + lim),
  });
});

app.listen(5174, () => {
  console.log("✅ Diamonds API: http://localhost:5174/api/diamonds");
});
