import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// build marker
export const __BUILD_MARKER__ = "2026-08-04T16-54Z";
(window as unknown as Record<string, string>).__vvBuild = __BUILD_MARKER__;
