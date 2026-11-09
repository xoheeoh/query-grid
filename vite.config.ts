import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite 설정. 백엔드가 없는 데모라 API 프록시는 두지 않는다.
// base: 앱이 놓이는 하위 경로. 로컬은 "/", GitHub Pages 배포 때는 워크플로가 BASE_PATH=/query-grid/ 를 넘긴다.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
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
  },
});
