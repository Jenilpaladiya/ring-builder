import { useMemo, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { useBuilder } from "../../../builder/BuilderContext";

// Normalize shapes to compare compatibility
function shapeKey(shape) {
  const s = String(shape || "").trim().toLowerCase();
  if (!s) return "";
  if (s.includes("round")) return "round";
  if (s.includes("oval")) return "oval";
  if (s.includes("pear")) return "pear";
  if (s.includes("emerald")) return "emerald";
  if (s.includes("cushion")) return "cushion";
  if (s.includes("radiant")) return "radiant";
  if (s.includes("princess")) return "princess";
  if (s.includes("heart")) return "heart";
  if (s.includes("marquise")) return "marquise";
  if (s.includes("asscher")) return "asscher";
  return s.split(" ")[0];
}

function eur(n) {
  const num = Number(n);
  const safe = Number.isFinite(num) ? num : 0;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(safe);
}

export default function Step3CompleteRing({ diamonds = [], settings = [], metals = [] }) {
  const {
    settingId,
    diamondId,
    metalId, // still exists in context, but we won't show it
    ringSize,
    engraving,
    setRingSize,
    setEngraving,
    setStep,
  } = useBuilder();

  const [error, setError] = useState("");
  const [price, setPrice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState("");

  const selectedSetting = useMemo(
    () => settings.find((s) => String(s.id) === String(settingId)) || null,
    [settings, settingId]
  );

  const selectedDiamond = useMemo(() => {
    if (!diamondId) return null;
    // prefer id match
    const byId = diamonds.find((d) => String(d.id) === String(diamondId));
    if (byId) return byId;
    // fallback sku match (if your context stored sku earlier)
    const bySku = diamonds.find((d) => String(d.sku) === String(diamondId));
    return bySku || null;
  }, [diamonds, diamondId]);

  // Compatibility: based on selected setting
  const allowedShapeKeys = useMemo(() => {
    const list = selectedSetting?.compatibleShapes ?? [];
    return list.map(shapeKey).filter(Boolean);
  }, [selectedSetting]);

  const diamondShapeKey = shapeKey(selectedDiamond?.shape);
  const isCompatible =
    allowedShapeKeys.length === 0 || allowedShapeKeys.includes(diamondShapeKey);

  // ✅ Metal removed from validation (still used in DB if you want, but not required)
  const canCalculate = Boolean(selectedSetting && selectedDiamond && isCompatible);

  function calculatePrice() {
    setError("");
    setSavedId("");

    if (!selectedSetting || !selectedDiamond) {
      setError("Please complete Step 1 & Step 2 first.");
      return;
    }

    if (!isCompatible) {
      setError(
        `Not compatible: Setting allows ${allowedShapeKeys.join(", ")} but selected is "${selectedDiamond?.shape}".`
      );
      setPrice(null);
      return;
    }

    // ✅ Metal removed from calculation (multiplier removed)
    const base = Number(selectedSetting.basePrice || 0);
    const diamondPrice = Number(selectedDiamond.price || 0);

    const engravingFee = String(engraving || "").trim() ? 25 : 0;
    const sizeFee = Number(ringSize) > 60 ? 20 : 0;

    const total = base + diamondPrice + engravingFee + sizeFee;

    setPrice({
      total,
      breakdown: {
        settingPrice: base,
        diamondPrice,
        engravingFee,
        sizeFee,
      },
    });
  }

  async function saveConfiguration() {
    setError("");
    setSavedId("");

    if (!canCalculate) {
      setError("Please select a compatible diamond first.");
      return;
    }
    if (!price) {
      setError("Click “Calculate Total” before saving.");
      return;
    }

    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, "ringConfigurations"), {
        settingId,
        diamondId: selectedDiamond?.id || diamondId,

        // keep metalId in DB if you want, otherwise remove next line
        metalId: metalId || "",

        ringSize,
        engraving: String(engraving || "").trim(),

        totalPrice: price.total,
        breakdown: price.breakdown,

        settingSnapshot: selectedSetting,
        diamondSnapshot: selectedDiamond,

        createdAt: serverTimestamp(),
      });

      setSavedId(docRef.id);
    } catch (e) {
      console.error(e);
      setError("Failed to save. Check Firestore Rules (write permission).");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel rb-step3">
      <div className="rb-top">
        <h2 className="rb-h2">Complete Your Ring</h2>
        <div className="rb-topRight">
          <button onClick={() => setStep(2)} className="rb-secondaryBtn">
            ← Back to Center Stone
          </button>
        </div>
      </div>

      {selectedDiamond && !isCompatible && (
        <p className="rb-error">
          ❌ Not compatible: Setting allows <b>{allowedShapeKeys.join(", ")}</b> but selected is{" "}
          <b>{selectedDiamond.shape}</b>.
        </p>
      )}

      <div className="rb-step3Grid">
        {/* LEFT */}
        <div className="rb-step3Card">
          <h3 className="rb-h3">Ring Size</h3>
          <input
            type="number"
            min={44}
            max={70}
            value={ringSize}
            onChange={(e) => setRingSize(Number(e.target.value))}
            className="rb-input"
          />

          <h3 className="rb-h3">Engraving (max 12 chars)</h3>
          <input
            value={engraving}
            onChange={(e) => setEngraving(e.target.value)}
            maxLength={12}
            placeholder="Optional (e.g., J ❤️ P)"
            className="rb-input"
          />

          <button onClick={calculatePrice} className="rb-primaryBtn" disabled={!canCalculate}>
            ✅ Calculate Total
          </button>

          <button onClick={saveConfiguration} className="rb-saveBtn" disabled={saving || !price}>
            {saving ? "Saving..." : "💾 Save Configuration"}
          </button>

          {savedId && (
            <p className="rb-success">
              ✅ Saved! Document ID: <b>{savedId}</b>
            </p>
          )}
          {error && <p className="rb-error">❌ {error}</p>}

          <div className="rb-note">
            * Engraving fee: €25 (if not empty) <br />
            * Size fee: €20 (if size &gt; 60)
          </div>
        </div>

        {/* RIGHT */}
        <div className="rb-step3Card">
          <h3 className="rb-h3">Summary</h3>

          <div className="rb-summaryRow">
            <div className="rb-summaryLabel">Setting</div>
            <div className="rb-summaryValue">{selectedSetting?.name || "-"}</div>
          </div>

          {/* ✅ Metal row removed */}

          <div className="rb-summaryRow">
            <div className="rb-summaryLabel">Center Stone</div>
            <div className="rb-summaryValue">
              {selectedDiamond
                ? `${selectedDiamond.carat}ct ${selectedDiamond.shape} • ${selectedDiamond.color}/${selectedDiamond.clarity} • ${eur(
                    selectedDiamond.price
                  )}`
                : "-"}
            </div>
          </div>

          <div className="rb-summaryRow">
            <div className="rb-summaryLabel">Ring Size</div>
            <div className="rb-summaryValue">{ringSize}</div>
          </div>

          <div className="rb-summaryRow">
            <div className="rb-summaryLabel">Engraving</div>
            <div className="rb-summaryValue">{String(engraving || "").trim() || "(none)"}</div>
          </div>

          <hr className="rb-divider" />

          <h3 className="rb-h3">Price</h3>

          {!price ? (
            <p className="rb-mutedP">Click “Calculate Total” to see pricing.</p>
          ) : (
            <>
              <div className="rb-total">Total: {eur(price.total)}</div>

              <div className="rb-breakdown">
                <div>Diamond: {eur(price.breakdown.diamondPrice)}</div>
                <div>Setting: {eur(price.breakdown.settingPrice)}</div>
                <div>Engraving: {eur(price.breakdown.engravingFee)}</div>
                <div>Size fee: {eur(price.breakdown.sizeFee)}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
