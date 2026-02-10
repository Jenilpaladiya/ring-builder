import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useBuilder } from "../../builder/BuilderContext";
import Stepper from "../../builder/Stepper";

import Step1SelectSetting from "./steps/Step1SelectSetting";
import Step2SelectStone from "./steps/Step2SelectStone";
import Step3CompleteRing from "./steps/Step3CompleteRing";
import "./builder.css";

export default function BuilderWizard() {
  const { step, settingId, metalId, diamondId } = useBuilder();

  const [settings, setSettings] = useState([]);
  const [diamonds, setDiamonds] = useState([]);
  const [metals, setMetals] = useState([]);
  const [err, setErr] = useState("");

  const toNum = (v) => {
    const n = Number(String(v ?? "").replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const normalizeDiamond = (d, idx) => {
    const shapeRaw = d.shape ?? d.Shape ?? d.SHAPE ?? "";
    const colorRaw = d.color ?? d.Color ?? d.COLOR ?? "";
    const clarityRaw = d.clarity ?? d.Clarity ?? d.CLARITY ?? "";
    const caratRaw = d.carat ?? d.Carat ?? d.CARAT ?? d["Carat"] ?? 0;
    const priceRaw = d.price ?? d.Price ?? d.PRICE ?? d["Price"] ?? 0;

    const shape = String(shapeRaw || "").trim().toLowerCase();
    const color = String(colorRaw || "").trim().toUpperCase();
    const clarity = String(clarityRaw || "").trim().toUpperCase();

    const carat = toNum(caratRaw);
    const price = toNum(priceRaw);

    const sku =
      String(d.sku ?? d.SKU ?? d.StockNo ?? d.stockNo ?? d.id ?? d.ID ?? "").trim() ||
      `diamond`;

    // ✅ unique id (fix duplicate key warning + selection)
    const id = `${sku}-${carat}-${price}-${idx}`;

    return {
      ...d,
      id,
      sku,
      shape,
      color,
      clarity,
      carat,
      price,
      lab: d.lab ?? d.Lab ?? d.LAB ?? "",
      imageUrl: d.imageUrl ?? d.ImageUrl ?? d.image ?? d.Image ?? "",
    };
  };

  const fetchJson = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} HTTP ${res.status}`);
    return res.json();
  };

  const pickArrayFromApi = (apiJson) => {
    if (Array.isArray(apiJson)) return apiJson;
    if (Array.isArray(apiJson?.diamonds)) return apiJson.diamonds;
    if (Array.isArray(apiJson?.data)) return apiJson.data;
    if (Array.isArray(apiJson?.items)) return apiJson.items;
    if (Array.isArray(apiJson?.results)) return apiJson.results;
    return [];
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setErr("");

        console.log("🔄 BuilderWizard loading...");

        // ✅ Firestore
        const [sSnap, mSnap] = await Promise.all([
          getDocs(collection(db, "ringSettings")),
          getDocs(collection(db, "metals")),
        ]);

        const settingsList = sSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const metalsList = mSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        console.log("✅ settings loaded:", settingsList.length);
        console.log("✅ metals loaded:", metalsList.length);

        // ✅ Diamonds API
        const apiJson = await fetchJson("/api/diamonds");
        console.log("✅ /api/diamonds raw response:", apiJson);

        const diamondsRaw = pickArrayFromApi(apiJson);
        console.log("✅ diamondsRaw length:", diamondsRaw.length);

        const diamondsList = diamondsRaw.map((d, idx) => normalizeDiamond(d, idx));

        console.log("💎 diamonds normalized:", diamondsList.length);
        console.log("💎 sample shapes:", diamondsList.slice(0, 10).map((x) => x.shape));
        console.log("💎 first diamond:", diamondsList[0]);

        if (!cancelled) {
          setSettings(settingsList);
          setMetals(metalsList);
          setDiamonds(diamondsList);

          if (diamondsList.length === 0) {
            setErr("Diamonds loaded = 0. Your /api/diamonds response is not an array or has different key.");
          }
        }
      } catch (e) {
        console.error("❌ BuilderWizard error:", e);
        if (!cancelled) setErr(e.message || "Failed to load catalog.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedSetting = useMemo(() => settings.find((s) => s.id === settingId), [settings, settingId]);
  const selectedMetal = useMemo(() => metals.find((m) => m.id === metalId), [metals, metalId]);
  const selectedDiamond = useMemo(() => diamonds.find((d) => d.id === diamondId), [diamonds, diamondId]);

  const summaries = {
    1: selectedSetting ? `${selectedSetting.name} – €${selectedSetting.basePrice}` : "",
    2: selectedDiamond ? `${selectedDiamond.shape} ${selectedDiamond.carat}ct – €${selectedDiamond.price}` : "",
    3: selectedMetal ? `${selectedMetal.type}` : "",
  };

  return (
    <div style={{ maxWidth: 1100, margin: "30px auto", padding: 16, fontFamily: "system-ui" }}>
      <h2 style={{ marginTop: 0 }}>Create Your Ring</h2>

      <Stepper summaries={summaries} />

      {err && <p style={{ color: "tomato" }}>{err}</p>}

      {step === 1 && <Step1SelectSetting settings={settings} metals={metals} />}
      {step === 2 && <Step2SelectStone diamonds={diamonds} settings={settings} />}
      {step === 3 && <Step3CompleteRing settings={settings} diamonds={diamonds} metals={metals} />}
    </div>
  );
}
