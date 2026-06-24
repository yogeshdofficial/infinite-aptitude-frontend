import { createRoot } from "react-dom/client";
import { setupIonicReact } from "@ionic/react";
import { Capacitor } from "@capacitor/core";

import "@ionic/react/css/core.css";
import "@fontsource-variable/inter/wght.css";

import "./index.css";
import "katex/dist/katex.min.css";
import "@/config/i18n";

import App from "./app";
import { initDatabase } from "@/db/initDatabase";
import { defineCustomElements } from "jeep-sqlite/loader";

setupIonicReact();

defineCustomElements(window);

async function bootstrap() {
  try {
    await initDatabase();

    createRoot(document.getElementById("root")!).render(<App />);

    // Register service worker only on web platform.
    // On native Android/iOS, Capacitor bundles assets inside the app binary,
    // so a SW is neither needed nor functional.
    if (
      Capacitor.getPlatform() === "web" &&
      "serviceWorker" in navigator
    ) {
      // Defer registration until after the page is fully painted
      // so it doesn't compete with the initial render for resources.
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
  }
}

bootstrap();
