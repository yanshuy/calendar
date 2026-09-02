import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: [
                "favicon.png",
                "favicon.svg",
                "apple-touch-icon.png",
            ],
            manifest: {
                name: "Calendar",
                short_name: "Calendar",
                description:
                    "Offline-first calendar application powered by OPFS and SQLite",
                theme_color: "#ffffff",
                background_color: "#ffffff",
                display: "standalone",
                orientation: "portrait-primary",
                icons: [
                    {
                        src: "/pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "/pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "/maskable-icon-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg,wasm}"],
            },
            devOptions: {
                enabled: true,
            },
        }),
        {
            name: "configure-response-headers",
            configureServer: (server) => {
                server.middlewares.use((_req, res, next) => {
                    res.setHeader(
                        "Cross-Origin-Embedder-Policy",
                        "require-corp",
                    );
                    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                    next();
                });
            },
            configurePreviewServer: (server) => {
                server.middlewares.use((_req, res, next) => {
                    res.setHeader(
                        "Cross-Origin-Embedder-Policy",
                        "require-corp",
                    );
                    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                    next();
                });
            },
        },
    ],
    optimizeDeps: {
        exclude: ["sqlocal"],
    },
    worker: {
        format: "es",
    },
    build: {
        target: "es2022",
    },
});
