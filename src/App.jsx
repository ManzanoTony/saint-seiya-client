import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import LandingScreen from "./components/LandingScreen";
import CommandCenter from "./components/CommandCenter";
import SaintDetailScreen from "./components/SaintDetailScreen";
import WarStatsScreen from "./components/WarStatsScreen";
import WinningScreen from "./components/WinningScreen";
import LosingScreen from "./components/LosingScreen";
import LoadingScreen from "./components/LoadingScreen";
import Music from "./components/Music";
import { requestApi } from "./assets/api";
import "./index.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";
const API_URL = `${API_BASE_URL}/saints`;

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [saints, setSaints] = useState([]);
  const [saintLoadError, setSaintLoadError] = useState("");
  const [isLoadingSaints, setIsLoadingSaints] = useState(true);
  const [saintRefresh, setSaintRefresh] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    requestApi(API_URL, {}, "Could not load Saints.")
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("The server returned an invalid Saint roster.");
        }
        if (isCurrent) {
          setSaints(data);
          setSaintLoadError("");
        }
      })
      .catch((error) => {
        console.error("Error fetching Saints:", error);
        if (isCurrent) {
          setSaintLoadError(error.message);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoadingSaints(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [location.pathname, saintRefresh]);

  useEffect(() => {
    const recoveryTimes = saints
      .filter((saint) => saint.status === "Injured")
      .map((saint) => Date.parse(saint.recoveryUntil))
      .filter(Number.isFinite);

    if (recoveryTimes.length === 0) {
      return undefined;
    }

    const nextRecoveryTime = Math.min(...recoveryTimes);
    const timer = setTimeout(async () => {
      try {
        const recoveredSaints = await requestApi(
          API_URL,
          {},
          "Could not refresh Saint recovery status."
        );
        setSaints(recoveredSaints);
      } catch (error) {
        console.error("Could not refresh Saint recovery status:", error);
        setSaintLoadError(error.message);
      }
    }, Math.max(0, nextRecoveryTime - Date.now()));

    return () => clearTimeout(timer);
  }, [saints]);

  const handleUpdateSaint = (updatedSaint) => {
    setSaints((prev) =>
      prev.map((s) => (String(s.id) === String(updatedSaint.id) ? updatedSaint : s))
    );
  };

  const handleDeleteSaint = (deletedId) => {
    setSaints((prev) => prev.filter((s) => String(s.id) !== String(deletedId)));
    navigate("/command");
  };

  const handleRetrySaintLoad = () => {
    setIsLoadingSaints(true);
    setSaintLoadError("");
    setSaintRefresh((previous) => previous + 1);
  };

  const handleReturnHome = async () => {
    const data = await requestApi(
      `${API_BASE_URL}/api/war/reset`,
      { method: "POST" },
      "Could not reset the Sanctuary."
    );
    setSaints(data.saints);
    navigate("/");
  };

  return (
    <div className="app-container">
      <Music />
      <Routes>
        {/* Landing Screen */}
        <Route
          path="/"
          element={
            <LandingScreen
              onStart={() => navigate("/command")}
              onSurrender={() => navigate("/war/defeat")}
            />
          }
        />

        {/* Command Center Roster */}
        <Route
          path="/command"
          element={
            <CommandCenter
              saints={saints}
              setSaints={setSaints}
              onBack={() => navigate("/")}
              onOpenWar={() => navigate("/war")}
              onSelectSaint={(saint) => navigate(`/saint/${saint.id}`)}
            />
          }
        />

        <Route
          path="/war"
          element={
            <WarStatsScreen
              saints={saints}
              setSaints={setSaints}
              onBack={() => navigate("/command")}
              onCampaignEnd={(outcome) => navigate(`/war/${outcome}`)}
            />
          }
        />

        <Route
          path="/war/victory"
          element={<WinningScreen onHome={handleReturnHome} />}
        />
        <Route
          path="/war/defeat"
          element={<LosingScreen onHome={handleReturnHome} />}
        />

        {/* Saint Detail Screen */}
        <Route
          path="/saint/:id"
          element={
            <DetailWrapper
              saints={saints}
              saintLoadError={saintLoadError}
              isLoadingSaints={isLoadingSaints}
              onRetryLoad={handleRetrySaintLoad}
              onBack={() => navigate("/command")}
              onUpdateSaint={handleUpdateSaint}
              onDeleteSaint={handleDeleteSaint}
            />
          }
        />
      </Routes>
    </div>
  );
}

// Helper component to extract ID from URL and pass the correct saint object
function DetailWrapper({
  saints,
  saintLoadError,
  isLoadingSaints,
  onRetryLoad,
  onBack,
  onUpdateSaint,
  onDeleteSaint,
}) {
  const { id } = useParams();
  const saint = saints.find((s) => String(s.id) === String(id));

  if (isLoadingSaints && saints.length === 0) {
    return (
      <main className="command-container">
        <LoadingScreen message="Loading Sanctuary archives..." className="loading-screen-fill" />
      </main>
    );
  }

  if (saintLoadError && saints.length === 0) {
    return (
      <div className="command-container">
        <p className="request-error" role="alert">
          Could not load the Saint records: {saintLoadError}
        </p>
        <button type="button" className="btn btn-primary" onClick={onRetryLoad}>
          Retry
        </button>
        <button type="button" className="btn btn-primary" onClick={onBack}>
          Back to Roster
        </button>
      </div>
    );
  }

  if (!saint) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#ff4d4d" }}>
        <h3>Warrior not found in Sanctuary records.</h3>
        <button onClick={onBack} className="btn btn-primary" style={{ marginTop: "15px" }}>
          Back to Roster
        </button>
      </div>
    );
  }

  return (
    <SaintDetailScreen
      key={saint.id}
      saint={saint}
      loadError={saintLoadError}
      onBack={onBack}
      onUpdateSaint={onUpdateSaint}
      onDeleteSaint={onDeleteSaint}
    />
  );
}

export default App;
