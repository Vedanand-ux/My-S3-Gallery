import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // lets the frontend call "/api/..." during local dev without CORS pain
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
