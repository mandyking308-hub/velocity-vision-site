import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import AppErrorBoundary from "./components/AppErrorBoundary.tsx";
import "./index.css";
import "./i18n";

/**
 * Malformed percent-encoding in the URL (e.g. /legal/%%%) makes the router throw
 * while decoding route params, which previously produced a blank white page.
 * Normalise the location to a safe not-found path before the app mounts.
 */
function guardMalformedLocation() {
  if (typeof window === "undefined") return;
  const { pathname, search } = window.location;
  try {
    decodeURIComponent(pathname);
    decodeURIComponent(search);
  } catch {
    window.history.replaceState(null, "", "/not-found");
  }
}
guardMalformedLocation();

createRoot(document.getElementById("root")!).render(

  <HelmetProvider>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </HelmetProvider>
);

// build marker
export const __BUILD_MARKER__ = "2026-08-04T16-54Z";
(window as unknown as Record<string, string>).__vvBuild = __BUILD_MARKER__;
