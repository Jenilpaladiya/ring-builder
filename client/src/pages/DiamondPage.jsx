import { useEffect, useState } from "react";

export default function DiamondPage() {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // pagination
  const [offset, setOffset] = useState(0);
  const limit = 60;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`/api/diamonds?limit=${limit}&offset=${offset}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load diamonds");
        setItems(data.results || []);
        setCount(data.count || 0);
      } catch (e) {
        setErr(e.message || "Error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [offset]);

  return (
    <div style={{ maxWidth: 1100, margin: "30px auto", padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Diamonds</h2>

      {err && <p style={{ color: "tomato" }}>{err}</p>}
      {loading && <p>Loading…</p>}

      <p style={{ opacity: 0.75 }}>
        Showing {items.length} of {count}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {items.map((d) => (
          <div
            key={d.id}
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: 12,
              textAlign: "left",
              background: "#fff",
            }}
          >
            <div style={{ fontWeight: 900 }}>€{d.price}</div>
            <div style={{ marginTop: 6 }}>
              {d.carat}ct {d.shape}
            </div>
            <div style={{ opacity: 0.8, fontSize: 13 }}>
              {d.color}/{d.clarity} {d.lab ? `• ${d.lab}` : ""}
            </div>
            <div style={{ opacity: 0.7, fontSize: 12, marginTop: 6 }}>
              ID: {d.id}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>
          Prev
        </button>
        <button disabled={offset + limit >= count} onClick={() => setOffset(offset + limit)}>
          Next
        </button>
      </div>
    </div>
  );
}
