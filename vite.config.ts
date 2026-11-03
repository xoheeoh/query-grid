import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite 개발 서버 설정
// - 프론트는 5173 포트에서 구동(핫리로드 — 백엔드 재시작 불필요)
// - '/api' 요청은 백엔드 API 서버로 프록시 → 동일 출처처럼 동작해 CORS 회피
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
      "@menus": fileURLToPath(new URL("./src/menus", import.meta.url)),
      "@pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
    },
  },
  server: {
    // 다른 Vite 프로젝트의 기본 포트(5173)와 겹치지 않도록 전용 포트 사용
    port: 5180,
    proxy: {
      "/api": {
        // 백엔드 API 서버 포트 — IntelliJ에서 다른 포트로 띄우면 이 값만 수정
        target: "http://localhost:5678",
        changeOrigin: true,
      },
    },
  },
});
