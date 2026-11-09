import React from "react";
import { createRoot } from "react-dom/client";
import "@xoheeoh/components/styles.css";
import "./index.css";
import App from "./App";
import { MainPage } from "@pages";
import { appPath, getLoginSession, isAppRoute } from "@utils";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found");
}

// /sample → 로그인 후 메인(MainPage), 그 외 → 로그인 App
function resolvePage() {
  if (isAppRoute(window.location.pathname, "/sample")) {
    // 로그인 기록이 없으면 메인을 보여주지 않고 로그인 화면으로 보낸다. (주소창에 직접 입력해도 막힘)
    if (!getLoginSession()) {
      window.location.replace(appPath("/"));
      return App;
    }
    return MainPage;
  }
  return App;
}

const Page = resolvePage();

createRoot(rootEl).render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>
);
