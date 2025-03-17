import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        allowedHosts: true,
        proxy: {
            "/api/presensi": "https://3000-ozanfn-absensiface-3em4y8v7crz.ws-us118.gitpod.io",
        },
    },
});
