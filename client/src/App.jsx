import { BuilderProvider } from "./builder/BuilderContext";
import BuilderWizard from "./pages/builder/BuilderWizard";
import DiamondPage from "./pages/DiamondPage";
import "./App.css";


export default function App() {
  return (
    <BuilderProvider>
      <BuilderWizard />
      {/* <DiamondPage /> */}
    </BuilderProvider>

  );
}
