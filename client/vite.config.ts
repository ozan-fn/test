import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
    plugins: [solid()],
    server: {
        allowedHosts: true,
        proxy: {
            "/api/presensi": "https://3000-ozanfn-absensiface-3em4y8v7crz.ws-us118.gitpod.io",
        },
    },
});
