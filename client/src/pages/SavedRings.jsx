import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";

// ✅ If your firebaseConfig.js is NOT inside src (it's in client/ root),
// then change this line to:  import { db } from "../../firebaseConfig";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

export default function SavedRings({ onSelect }) {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    setErr("");

    const q = query(
      collection(db, "ringConfigurations"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(rows);
      },
      (e) => {
        console.error(e);
        setErr("Failed to load saved rings.");
      }
    );

    return () => unsub();
  }, []);

  async function handleDelete(id) {
    const ok = confirm("Delete this saved ring?");
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "ringConfigurations", id));
    } catch (e) {
      console.error(e);
      alert("Delete failed.");
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h2 style={{ marginTop: 0 }}>💾 Saved Rings</h2>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Click “Load” to open the configuration in the builder.
      </p>

      {err && <p style={{ color: "tomato" }}>{err}</p>}

      {items.length === 0 ? (
        <p>No saved configurations yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((it) => {
            const d = it.diamondSnapshot;
            const s = it.settingSnapshot;
            const m = it.metalSnapshot;

            const created =
              it.createdAt?.toDate?.() ? it.createdAt.toDate().toLocaleString() : "—";

            return (
              <div key={it.id} style={{ border: "1px solid #ccc", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>
                      Total: €{it.totalPrice ?? "—"}
                    </div>

                    <div style={{ opacity: 0.9, marginTop: 6 }}>
                      <b>Diamond:</b>{" "}
                      {d ? `${d.shape} ${d.carat}ct ${d.color}/${d.clarity}` : it.diamondId}
                    </div>
                    <div style={{ opacity: 0.9 }}>
                      <b>Setting:</b> {s ? s.name : it.settingId}
                    </div>
                    <div style={{ opacity: 0.9 }}>
                      <b>Metal:</b> {m ? m.type : it.metalId}
                    </div>
                    <div style={{ opacity: 0.9 }}>
                      <b>Size:</b> {it.ringSize ?? "—"} | <b>Engraving:</b>{" "}
                      {it.engraving ? it.engraving : "(none)"}
                    </div>

                    <div style={{ marginTop: 6, opacity: 0.7, fontSize: 13 }}>
                      Created: {created} | Doc: {it.id}
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 8, alignContent: "start" }}>
                    <button
                      onClick={() => onSelect?.(it)}
                      style={{ padding: "10px 12px", borderRadius: 10, cursor: "pointer" }}
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(it.id)}
                      style={{ padding: "10px 12px", borderRadius: 10, cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {it.breakdown && (
                  <div style={{ marginTop: 10, opacity: 0.85, fontSize: 14 }}>
                    <b>Breakdown:</b> Diamond €{it.breakdown.diamondPrice} + Setting €{it.breakdown.settingPrice}
                    {it.breakdown.engravingFee ? ` + Engraving €${it.breakdown.engravingFee}` : ""}
                    {it.breakdown.sizeFee ? ` + Size €${it.breakdown.sizeFee}` : ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
