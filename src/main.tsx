import React from "react";
import { createRoot } from "react-dom/client";
import "@xoheeoh/components/styles.css";
import "./index.css";
import App from "./App";
import { MainPage } from "@pages";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found");
}

// /sample → 로그인 후 메인(MainPage), 그 외 → 로그인 App
function resolvePage() {
  const path = window.location.pathname;
  if (path.startsWith("/sample")) return MainPage;
  return App;
}

const Page = resolvePage();

createRoot(rootEl).render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>
);
