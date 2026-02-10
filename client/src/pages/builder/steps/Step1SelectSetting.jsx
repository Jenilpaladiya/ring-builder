import { useMemo, useState } from "react";
import { useBuilder } from "../../../builder/BuilderContext";

export default function Step1SelectSetting({ settings, metals }) {
  const { settingId, setSettingId, metalId, setMetalId, setStep } = useBuilder();

  // Filters
  const [styleFilter, setStyleFilter] = useState("All"); // All | Solitaire | Halo | Bezel

  const selectedMetal = useMemo(() => metals.find((m) => m.id === metalId) || null, [metals, metalId]);

  const availableStyles = useMemo(() => {
    const set = new Set(settings.map((s) => s.style).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [settings]);

  const filteredSettings = useMemo(() => {
    let list = [...settings];
    if (styleFilter !== "All") {
      list = list.filter((s) => s.style === styleFilter);
    }
    // you can also sort here later (Best Selling / Price)
    return list;
  }, [settings, styleFilter]);

  const canContinue = Boolean(settingId);

  return (
    <div className="rb-layout">
      {/* Left filters */}
      <aside className="rb-sidebar">
        <h3 className="rb-sidebarTitle">Choose A Setting</h3>

        <div className="rb-block">
          <div className="rb-blockTitle">Metal</div>

          <div className="rb-radioList">
            {metals.map((m) => {
              const active = metalId === m.id;
              return (
                <label key={m.id} className="rb-radioRow">
                  <input
                    type="radio"
                    name="metal"
                    value={m.id}
                    checked={active}
                    onChange={() => setMetalId(m.id)}
                  />
                  <span className="rb-dotWrap">
                    <span
                      className="rb-dot"
                      style={{
                        "--dot": m.swatch || "#ddd",
                      }}
                    />
                  </span>
                  <span className={active ? "rb-fw800" : "rb-fw500"}>{m.type}</span>
                </label>
              );
            })}
          </div>

          {selectedMetal && (
            <div className="rb-miniNote">
              Price multiplier: <b>x{selectedMetal.multiplier}</b>
            </div>
          )}
        </div>

        <div className="rb-block">
          <div className="rb-blockTitle">Setting</div>

          <div className="rb-pillList">
            {availableStyles.map((st) => (
              <button
                key={st}
                onClick={() => setStyleFilter(st)}
                className={`rb-pill ${styleFilter === st ? "rb-pill--active" : ""}`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="rb-block">
          <button
            disabled={!canContinue}
            onClick={() => setStep(2)}
            className="rb-primaryBtn"
          >
            Continue → Center Stone
          </button>

          {!canContinue && (
            <div className="rb-help">
              Select <b>metal</b> and a <b>setting</b> to continue.
            </div>
          )}
        </div>
      </aside>

      {/* Right grid */}
      <main className="rb-gridWrap">
        <div className="rb-gridHeader">
          <div className="rb-gridTitle">Settings</div>
          <div className="rb-gridCount">Showing {filteredSettings.length} results</div>
        </div>

        <div className="rb-grid">
          {filteredSettings.map((s) => {
            const active = settingId === s.id;

            return (
              <button
                key={s.id}
                onClick={() => setSettingId(s.id)}
                className={`rb-card ${active ? "rb-card--active" : ""}`}
              >
                <div className="rb-imgBox">
                  {s.imageUrl ? (
                    <img src={s.imageUrl} alt={s.name} className="rb-img" />
                  ) : (
                    <div className="rb-imgPlaceholder">
                      <img
                        src={setting.imageUrl}
                        alt={setting.name}
                        className="rb-imgFallback"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/600x400?text=Ring+Image";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="rb-cardBody">
                  <div className="rb-cardName">{s.name}</div>
                  <div className="rb-cardMeta">
                    <span className="rb-muted">from</span> €{s.basePrice}
                  </div>
                  <div className="rb-cardMetaSmall">
                    {s.style ? s.style : "—"} • Shapes:{" "}
                    {(s.compatibleShapes || []).slice(0, 3).join(", ") || "—"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
