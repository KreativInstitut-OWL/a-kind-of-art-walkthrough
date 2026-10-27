import { PlayCanvasApplication } from "./components/PlayCanvasApplication";
import { QualitySelector } from "./components/QualitySelector";
import { useEffect, useState } from "react";

function App() {
  const [showQualitySelector, setShowQualitySelector] = useState(() => {
    try {
      // Check if user has already selected quality
      return !localStorage.getItem("qualitySelected");
    } catch (e) {
      // If localStorage is unavailable, skip quality selector
      console.warn("localStorage unavailable, skipping quality selector", e);
      return false;
    }
  });

  const handleQualitySelected = () => {
    try {
      localStorage.setItem("qualitySelected", "true");
      setShowQualitySelector(false);
    } catch (e) {
      console.warn("Failed to save quality selection", e);
      // Still proceed even if localStorage fails
      setShowQualitySelector(false);
    }
  };

  useEffect(() => {
    // Subscribe to check if quality was set
    if (showQualitySelector) {
      const handleStorageChange = () => {
        try {
          if (localStorage.getItem("qualitySelected")) {
            handleQualitySelected();
          }
        } catch (e) {
          console.warn("Storage check failed", e);
        }
      };
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, [showQualitySelector]);

  return (
    <>
      {showQualitySelector ? (
        <QualitySelector onSelected={handleQualitySelected} />
      ) : (
        <PlayCanvasApplication />
      )}
    </>
  );
}

export default App;
