
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setupGlobalErrorHandling } from "@/hooks/useErrorBoundary";
import { FeatureProvider } from "@/components/FeatureToggle";

// Setup global error handling
setupGlobalErrorHandling();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FeatureProvider>
      <App />
    </FeatureProvider>
  </StrictMode>
);
