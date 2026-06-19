import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { setupIonicReact } from "@ionic/react";

import "@ionic/react/css/core.css";
import "@fontsource-variable/inter/wght.css";

import "./index.css";
import "@/config/i18n";

import App from "./app";

setupIonicReact();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
