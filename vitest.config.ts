import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
    plugins: [svelte()],
    test: {
        environment: "jsdom",
        setupFiles: ["./src/setupTests.ts"],
        include: ["src/**/*.{test,spec}.{js,ts}"],
        globals: true,
    },
    resolve: {
        conditions: ["browser"],
    },
});
