import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
	plugins: [solid()],
	server: {
		allowedHosts: true,
		proxy: {
			"/api/presensi": "http://localhost:3000",
		},
	},      
});
