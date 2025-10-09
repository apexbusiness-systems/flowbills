import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applySPNonce } from "./lib/security";
import { performanceMonitor } from "./lib/performance-monitor";
import { queryOptimizer } from "./lib/query-optimizer";

// Apply CSP nonce at runtime
console.log('[FlowBills] Initializing application...');
applySPNonce();
console.log('[FlowBills] CSP nonce applied');

// Initialize performance monitoring ONCE - only in production
if (!import.meta.env.DEV) {
  const initPerformance = () => {
    performanceMonitor.initializeWebVitals();
    performanceMonitor.startAPIMonitoring();
    queryOptimizer.startPeriodicCleanup();
  };
  
  // Defer initialization to avoid blocking initial render
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPerformance);
  } else {
    initPerformance();
  }
}

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

console.log('[FlowBills] Mounting React application...');
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('[FlowBills] Root element not found!');
} else {
  console.log('[FlowBills] Root element found, creating React root...');
  try {
    const root = createRoot(rootElement);
    console.log('[FlowBills] Rendering App component...');
    root.render(<App />);
    console.log('[FlowBills] App component rendered successfully');
  } catch (error) {
    console.error('[FlowBills] Error rendering app:', error);
  }
}
