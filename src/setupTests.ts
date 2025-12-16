import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/svelte";
import { afterEach, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock ScrollTo
Object.defineProperty(window, "scrollTo", {
    value: vi.fn(),
    writable: true,
});
