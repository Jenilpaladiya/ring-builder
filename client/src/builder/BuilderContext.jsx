import { createContext, useContext, useEffect, useMemo, useState } from "react";

const BuilderContext = createContext(null);

const STORAGE_KEY = "ring_builder_state_v1";


// Keep defaults here (this is the state you want on first load / reset)
const DEFAULT_STATE = {
  step: 1,
  settingId: "",
  metalId: "",
  diamondId: "",
  ringSize: 54,
  engraving: "",
};

function safeReadStorage() {
  // Guard for SSR / build tools
  if (typeof window === "undefined") return DEFAULT_STATE;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;

    const parsed = JSON.parse(raw);

    // Merge with defaults so missing keys never crash your app
    return {
      ...DEFAULT_STATE,
      ...parsed,
    };
  } catch (e) {
    console.warn("Failed to read builder state from localStorage:", e);
    return DEFAULT_STATE;
  }
}

function safeWriteStorage(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to write builder state to localStorage:", e);
  }
}

export function BuilderProvider({ children }) {
  // Single state object (easier to persist)
  const [state, setState] = useState(() => safeReadStorage());

  // Persist ANY change
  useEffect(() => {
    safeWriteStorage(state);
  }, [state]);

  // Setters (keep same API style)
  const setStep = (value) =>
    setState((prev) => ({
      ...prev,
      step: typeof value === "function" ? value(prev.step) : value,
    }));

  const setSettingId = (value) =>
    setState((prev) => ({
      ...prev,
      settingId: typeof value === "function" ? value(prev.settingId) : value,
    }));

  const setMetalId = (value) =>
    setState((prev) => ({
      ...prev,
      metalId: typeof value === "function" ? value(prev.metalId) : value,
    }));

  const setDiamondId = (value) =>
    setState((prev) => ({
      ...prev,
      diamondId: typeof value === "function" ? value(prev.diamondId) : value,
    }));

  const setRingSize = (value) =>
    setState((prev) => ({
      ...prev,
      ringSize: typeof value === "function" ? value(prev.ringSize) : value,
    }));

  const setEngraving = (value) =>
    setState((prev) => ({
      ...prev,
      engraving: typeof value === "function" ? value(prev.engraving) : value,
    }));

  // Reset (optional but recommended)
  const resetBuilder = () => {
    setState(DEFAULT_STATE);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value = useMemo(
    () => ({
      // state
      step: state.step,
      settingId: state.settingId,
      metalId: state.metalId,
      diamondId: state.diamondId,
      ringSize: state.ringSize,
      engraving: state.engraving,

      // setters
      setStep,
      setSettingId,
      setMetalId,
      setDiamondId,
      setRingSize,
      setEngraving,

      // helpers
      resetBuilder,
    }),
    [state]
  );

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
}

export function useBuilder() {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilder must be used within BuilderProvider");
  return ctx;
}
