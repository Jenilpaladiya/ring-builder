import { useMemo, useState, useEffect } from "react";
import { useBuilder } from "../../../builder/BuilderContext";

const fmtEUR = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

function normStr(v) {
  return String(v ?? "").trim();
}
function normLower(v) {
  return normStr(v).toLowerCase();
}
function prettyShape(shapeKey) {
  if (!shapeKey) return "Unknown";
  return shapeKey
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export default function Step2SelectStone({ diamonds = [], settings = [] }) {
  const { settingId, diamondId, setDiamondId, setStep } = useBuilder();

  const selectedSetting = useMemo(() => {
    return (settings || []).find((s) => String(s.id) === String(settingId)) || null;
  }, [settings, settingId]);

  // ✅ Allowed shapes for current setting (for “compatibility” badge/disable)
  const allowedShapeSet = useMemo(() => {
    const arr = selectedSetting?.compatibleShapes || [];
    return new Set(arr.map((x) => normLower(x)));
  }, [selectedSetting]);

  const isCompatible = (d) => {
    // If setting has no restriction -> everything compatible
    if (!allowedShapeSet || allowedShapeSet.size === 0) return true;
    const s = normLower(d.shape);
    return allowedShapeSet.has(s);
  };

  // UI state
  const [shape, setShape] = useState("all");
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("priceLow");
  const [caratMin, setCaratMin] = useState("");
  const [caratMax, setCaratMax] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [color, setColor] = useState("all");
  const [clarity, setClarity] = useState("all");

  // ✅ Shapes list from ALL diamonds (not compatible-only)
  const shapeOptions = useMemo(() => {
    const set = new Set();
    for (const d of diamonds) {
      const s = normLower(d.shape);
      if (s) set.add(s);
    }
    const list = Array.from(set).sort((a, b) => a.localeCompare(b));
    return [{ key: "all", label: "All" }, ...list.map((k) => ({ key: k, label: prettyShape(k) }))];
  }, [diamonds]);

  const colorOptions = useMemo(() => {
    const set = new Set();
    for (const d of diamonds) {
      const c = normStr(d.color).toUpperCase();
      if (c) set.add(c);
    }
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [diamonds]);

  const clarityOptions = useMemo(() => {
    const set = new Set();
    for (const d of diamonds) {
      const c = normStr(d.clarity).toUpperCase();
      if (c) set.add(c);
    }
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [diamonds]);

  // ✅ FILTERS: Apply to ALL diamonds (compatibility does NOT remove items)
  const filtered = useMemo(() => {
    let list = [...diamonds];

    // shape
    if (shape !== "all") list = list.filter((d) => normLower(d.shape) === shape);

    // color/clarity
    if (color !== "all") list = list.filter((d) => normStr(d.color).toUpperCase() === color);
    if (clarity !== "all") list = list.filter((d) => normStr(d.clarity).toUpperCase() === clarity);

    // ranges
    const cMin = caratMin === "" ? null : Number(caratMin);
    const cMax = caratMax === "" ? null : Number(caratMax);
    const pMin = priceMin === "" ? null : Number(priceMin);
    const pMax = priceMax === "" ? null : Number(priceMax);

    if (cMin !== null) list = list.filter((d) => Number(d.carat) >= cMin);
    if (cMax !== null) list = list.filter((d) => Number(d.carat) <= cMax);
    if (pMin !== null) list = list.filter((d) => Number(d.price) >= pMin);
    if (pMax !== null) list = list.filter((d) => Number(d.price) <= pMax);

    // sort
    if (sort === "priceLow") list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "priceHigh") list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "caratHigh") list.sort((a, b) => Number(b.carat) - Number(a.carat));

    return list;
  }, [diamonds, shape, color, clarity, caratMin, caratMax, priceMin, priceMax, sort]);

  const canContinue = Boolean(diamondId);

  // ✅ Debug logs (optional)
  useEffect(() => {
    console.log("🧩 Step2 Debug");
    console.log("diamonds prop length:", diamonds.length);
    console.log("shape selected:", shape);
    console.log("filtered length:", filtered.length);
    console.log("allowed shapes:", Array.from(allowedShapeSet || []));
  }, [diamonds.length, shape, filtered.length, allowedShapeSet]);

  return (
    <div className="rb-page">
      <div className="rb-top">
        <h2 className="rb-h2">Select Your Stone</h2>

        <div className="rb-topRight">
          <button
            onClick={() => setView("grid")}
            className={`rb-smallBtn ${view === "grid" ? "rb-smallBtn--active" : ""}`}
          >
            Grid
          </button>
          <button
            onClick={() => setView("list")}
            className={`rb-smallBtn ${view === "list" ? "rb-smallBtn--active" : ""}`}
          >
            List
          </button>

          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rb-select">
            <option value="priceLow">Price (Low)</option>
            <option value="priceHigh">Price (High)</option>
            <option value="caratHigh">Carat (High)</option>
          </select>
        </div>
      </div>

      {/* ✅ Shape bar from ALL shapes */}
      <div className="rb-shapeBar">
        {shapeOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setShape(opt.key)}
            className={`rb-shapeBtn ${shape === opt.key ? "rb-shapeBtn--active" : ""}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="rb-layout">
        {/* Left filters */}
        <aside className="rb-sidebar">
          <div className="rb-blockTitle">Filters</div>

          <div className="rb-block">
            <div className="rb-label">Carat Weight</div>
            <div className="rb-row2">
              <input value={caratMin} onChange={(e) => setCaratMin(e.target.value)} placeholder="min" className="rb-input" />
              <input value={caratMax} onChange={(e) => setCaratMax(e.target.value)} placeholder="max" className="rb-input" />
            </div>
          </div>

          <div className="rb-block">
            <div className="rb-label">Price (€)</div>
            <div className="rb-row2">
              <input value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="min" className="rb-input" />
              <input value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="max" className="rb-input" />
            </div>
          </div>

          <div className="rb-block">
            <div className="rb-label">Color</div>
            <select value={color} onChange={(e) => setColor(e.target.value)} className="rb-selectFull">
              {colorOptions.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All" : c}
                </option>
              ))}
            </select>
          </div>

          <div className="rb-block">
            <div className="rb-label">Clarity</div>
            <select value={clarity} onChange={(e) => setClarity(e.target.value)} className="rb-selectFull">
              {clarityOptions.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All" : c}
                </option>
              ))}
            </select>
          </div>

          <div className="rb-block">
            <div className="rb-compatibleNote">
              Compatible with your setting:
              <div className="rb-compatibleName">{selectedSetting?.name || "(select a setting first)"}</div>
              {allowedShapeSet?.size > 0 && (
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  Allowed: {Array.from(allowedShapeSet).join(", ")}
                </div>
              )}
            </div>
          </div>

          <div className="rb-block">
            <button disabled={!canContinue} onClick={() => setStep(3)} className="rb-primaryBtn">
              Continue → Complete Ring
            </button>
            {!canContinue && <div className="rb-help">Select a diamond to continue.</div>}
          </div>
        </aside>

        {/* Results */}
        <main className="rb-results">
          <div className="rb-resultsHeader">
            <div className="rb-fw800">
              Viewing {filtered.length} of {diamonds.length} diamonds
            </div>
          </div>

          {view === "grid" ? (
            <div className="rb-diamondGrid">
              {filtered.map((d) => {
                const active = diamondId === d.id;
                const ok = isCompatible(d);

                const imgSrc =
                  d.imageUrl ||
                  `https://placehold.co/600x400?text=${encodeURIComponent(prettyShape(normLower(d.shape) || "diamond"))}`;

                return (
                  <button
                    key={d.id}
                    onClick={() => setDiamondId(d.id)}
                    disabled={false}
                    style={!ok ? { opacity: 0.65 } : undefined}
                    title={!ok ? "Not compatible (you can still select)" : "Select diamond"}
                    className={`rb-diamondCard ${active ? "rb-diamondCard--active" : ""}`}

                  >
                    <div className="rb-dImg">
                      <div className="rb-imgWrap">
                        <img
                          src={imgSrc}
                          alt={`${d.shape || "Diamond"} diamond`}
                          style={{
                            width: "100%",
                            height: 220,
                            objectFit: "cover",
                            borderRadius: 12,
                            background: "#f3f4f6",
                          }}
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/600x400?text=Diamond";
                          }}
                        />
                      </div>
                    </div>

                    <div className="rb-cardBody">
                      <div className="rb-price">{fmtEUR.format(Number(d.price || 0))}</div>
                      <div className="rb-title">
                        {Number(d.carat || 0).toFixed(2)}ct {prettyShape(normLower(d.shape))} •{" "}
                        {normStr(d.color).toUpperCase()}/{normStr(d.clarity).toUpperCase()}
                      </div>
                      <div className="rb-sub">
                        {d.lab ? `• ${d.lab}` : ""}
                        {!ok ? " • Not compatible" : ""}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rb-listWrap">
              {filtered.map((d) => {
                const active = diamondId === d.id;
                const ok = isCompatible(d);

                return (
                  <button
                    key={d.id}
                    onClick={() => ok && setDiamondId(d.id)}
                    disabled={!ok}
                    className={`rb-listRow ${active ? "rb-listRow--active" : ""}`}
                    style={!ok ? { opacity: 0.55, cursor: "not-allowed" } : undefined}
                    title={!ok ? "Not compatible with selected setting" : "Select diamond"}
                  >
                    <div className="rb-listLeft">
                      <div className="rb-fw800">
                        {Number(d.carat || 0).toFixed(2)}ct {prettyShape(normLower(d.shape))}
                      </div>
                      <div className="rb-listSub">
                        {normStr(d.color).toUpperCase()}/{normStr(d.clarity).toUpperCase()}
                        {d.lab ? ` • ${d.lab}` : ""}
                        {!ok ? " • Not compatible" : ""}
                      </div>
                    </div>
                    <div className="rb-fw900">{fmtEUR.format(Number(d.price || 0))}</div>
                  </button>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
