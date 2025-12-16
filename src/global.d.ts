// global.d.ts or window.d.ts
declare global {
  interface Window {
    dataLayer: any[]; // Or a more specific type like DatalayerObject[]
    CookieScript: any;
  }
}

// If this is a module, you might need an empty export to ensure it's treated as a module
export {};
