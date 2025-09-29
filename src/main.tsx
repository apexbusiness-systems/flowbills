import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applySPNonce } from "./lib/security";

// Apply CSP nonce at runtime
applySPNonce();

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        // Only log in development
        if (import.meta.env.DEV) {
          console.log('FlowBills SW registered: ', registration);
        }
      })
      .catch((registrationError) => {
        // Only log in development
        if (import.meta.env.DEV) {
          console.log('FlowBills SW registration failed: ', registrationError);
        }
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
