import { createRoot } from "react-dom/client";
import { setupIonicReact } from "@ionic/react";
import "./index.css";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";
// Supports weights 100-900
import "@fontsource-variable/inter/wght.css";

import "@/config/i18n.ts";
import App from "./app";

setupIonicReact();

createRoot(document.getElementById("root")!).render(<App />);
