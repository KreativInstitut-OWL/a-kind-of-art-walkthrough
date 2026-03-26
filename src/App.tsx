import { PlayCanvasApplication } from "./components/PlayCanvasApplication";
import { QualitySelector } from "./components/QualitySelector";
import { useEffect, useState } from "react";

function App() {
  const [showQualitySelector, setShowQualitySelector] = useState(() => {
    // Check if user has already selected quality
    return !localStorage.getItem("qualitySelected");
  });

  const handleQualitySelected = () => {
    localStorage.setItem("qualitySelected", "true");
    setShowQualitySelector(false);
  };

  useEffect(() => {
    // Subscribe to check if quality was set
    if (showQualitySelector) {
      const handleStorageChange = () => {
        if (localStorage.getItem("qualitySelected")) {
          handleQualitySelected();
        }
      };
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, [showQualitySelector]);

  if (showQualitySelector) {
    return <QualitySelector onSelected={handleQualitySelected} />;
  }

  return <PlayCanvasApplication />;
}

export default App;
