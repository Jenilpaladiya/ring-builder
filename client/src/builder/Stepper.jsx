import { useBuilder } from "./BuilderContext";

export default function Stepper({ summaries }) {
  const { step, setStep } = useBuilder();

  const steps = [
    { n: 1, title: "Select Setting" },
    { n: 2, title: "Choose Center Stone" },
    { n: 3, title: "Complete Ring" },
  ];

  return (
    <div style={styles.wrap}>
      {steps.map((s, idx) => {
        const active = step === s.n;
        const done = step > s.n;

        return (
          <div key={s.n} style={{ ...styles.item, ...(active ? styles.active : {}) }}>
            <div style={{ ...styles.badge, ...(done ? styles.badgeDone : {}), ...(active ? styles.badgeActive : {}) }}>
              {s.n}
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={styles.title}>{s.title}</div>
              <div style={styles.sub}>
                {summaries?.[s.n] ? summaries[s.n] : <span style={{ opacity: 0.65 }}>Not selected</span>}
              </div>
              {s.n < step && (
                <button onClick={() => setStep(s.n)} style={styles.changeBtn}>
                  Change
                </button>
              )}
            </div>

            {idx < steps.length - 1 && <div style={styles.divider} />}
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    gap: 14,
    alignItems: "stretch",
    border: "1px solid #ddd",
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    background: "#fff",
  },
  item: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  active: {
    outline: "2px solid rgba(0,0,0,0.08)",
    borderRadius: 12,
    padding: 10,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    border: "1px solid #bbb",
    fontWeight: 800,
    background: "#f7f7f7",
    flex: "0 0 auto",
  },
  badgeActive: { border: "1px solid #111", background: "#111", color: "white" },
  badgeDone: { border: "1px solid #0b6", background: "#0b6", color: "white" },

  title: { fontWeight: 800, fontSize: 14 },
  sub: { fontSize: 13, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  changeBtn: {
    marginTop: 6,
    border: "none",
    background: "transparent",
    textDecoration: "underline",
    cursor: "pointer",
    padding: 0,
    fontSize: 13,
    opacity: 0.8,
    color:"#1a1a1a",
  },
  divider: { width: 1, background: "#e5e5e5", marginLeft: 10, marginRight: 6 },
};
