import { createRoot } from "react-dom/client";
import { setupIonicReact } from "@ionic/react";

import "@ionic/react/css/core.css";
import "@fontsource-variable/inter/wght.css";

import "./index.css";
import "@/config/i18n";

import App from "./app";
import { initDatabase } from "@/db/initDatabase";

setupIonicReact();

async function bootstrap() {
  try {
    await initDatabase();

    createRoot(document.getElementById("root")!).render(<App />);
  } catch (e) {
    console.error("Failed to initialize database", e);
  }
}

bootstrap();
