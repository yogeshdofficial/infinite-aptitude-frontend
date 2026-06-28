import { createRoot } from "react-dom/client";
import { setupIonicReact } from "@ionic/react";
import { Capacitor } from "@capacitor/core";

import "@ionic/react/css/core.css";

// Single variable-weight Inter import (covers all weights via font-variation-settings).
// The /wght.css entry point loads only the weight axis, keeping the CSS lean.
import "@fontsource-variable/inter/wght.css";

import "./index.css";
import "katex/dist/katex.min.css";
import "@/config/i18n";

import App from "./app";
import { BootSplash, BootError } from "./Boot";
import { initDatabase } from "@/db/initDatabase";
import { defineCustomElements } from "jeep-sqlite/loader";

setupIonicReact({
  // Prevent Ionic from injecting its own ripple/tap animations that can
  // conflict with our shadcn interaction styles.
  rippleEffect: false,
  // Use 'md' mode universally for consistent cross-platform appearance.
  mode: "md",
});

// Register jeep-sqlite early so the custom element is available before
// any page renders and tries to open the database.
defineCustomElements(window);

async function bootstrap() {
  const rootEl = document.getElementById("root")!;
  const root = createRoot(rootEl);

  // Show a minimal splash while the DB connection is established.
  // BootSplash has zero library dependencies so it can never fail.
  root.render(<BootSplash />);

  try {
    await initDatabase();

    root.render(<App />);

    // Register service worker on web only — Capacitor native builds
    // bundle assets inside the app binary, making a SW unnecessary.
    if (
      Capacitor.getPlatform() === "web" &&
      "serviceWorker" in navigator
    ) {
      // Defer until after first paint to avoid competing for resources.
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.debug("[SW] Registered:", reg.scope);
          })
          .catch((err) => {
            console.warn("[SW] Registration failed:", err);
          });
      });
    }
  } catch (e) {
    console.error("Failed to initialize database", e);
    root.render(<BootError onRetry={() => window.location.reload()} />);
  }
}

bootstrap();
