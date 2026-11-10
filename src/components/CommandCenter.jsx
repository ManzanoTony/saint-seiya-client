import { useState, useEffect } from "react";
import { requestApi } from "../assets/api";
import LoadingScreen from "./LoadingScreen";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";
const API_URL = `${API_BASE_URL}/saints`;

function CommandCenter({ saints, setSaints, onBack, onOpenWar, onSelectSaint }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRank, setFilterRank] = useState("All");
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoadingSaints, setIsLoadingSaints] = useState(true);
  const [creationStep, setCreationStep] = useState("");
  const [rosterError, setRosterError] = useState("");
  const [actionError, setActionError] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");

  // Create Form State
  const [formData, setFormData] = useState({
    name: "",
    rank: "Bronze",
    constellation: "",
    gender: "Male"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    requestApi(API_URL, {}, "Could not load Saints.")
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("The server returned an invalid Saint roster.");
        }
        if (isCurrent) {
          setSaints(data);
          setRosterError("");
        }
      })
      .catch((error) => {
        console.error("Error fetching Saints:", error);
        if (isCurrent) {
          setRosterError(error.message);
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
  }, [setSaints]);

  const handleCreateSaint = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCreationStep("Generating Saint lore...");
    setActionError("");
    setNoticeMessage("");

    const fullRank = `${formData.rank} Saint`;
    const defaultPower = formData.rank === "Gold" ? 250 : formData.rank === "Silver" ? 160 : 115;
    const defaultImage = formData.rank === "Gold" ? "/Saga.png" : formData.rank === "Silver" ? "/Marin.png" : "/Seiya.png";

    let generatedLore = "";
    let loreWarning = "";
    try {
      const loreData = await requestApi(
        `${API_BASE_URL}/api/generate-lore`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            saintName: formData.name,
            rank: fullRank,
            constellation: formData.constellation,
            gender: formData.gender,
            isCustom: true
          })
        },
        "Could not generate Saint lore."
      );
      if (typeof loreData?.lore !== "string" || !loreData.lore.trim()) {
        throw new Error("The lore service returned no lore text.");
      }
      generatedLore = loreData.lore;
    } catch (err) {
      console.error("Lore generation failed while creating Saint:", err);
      loreWarning = `Saint lore could not be generated: ${err.message}`;
    }

    const newSaint = {
      name: formData.name,
      rank: fullRank,
      constellation: formData.constellation,
      gender: formData.gender,
      cosmosPower: defaultPower,
      status: "Ready",
      image: defaultImage,
      comments: "",
      lore: generatedLore,
      isCustom: true
    };

    try {
      setCreationStep("Saving Saint...");
      const created = await requestApi(
        API_URL,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSaint),
        },
        "Could not create Saint."
      );
      setSaints((prev) => [...prev, created]);
      setFormData({ name: "", rank: "Bronze", constellation: "", gender: "Male" });
      setShowCreateModal(false);
      if (loreWarning) {
        setNoticeMessage(`${loreWarning} The Saint was created; you can reveal lore later.`);
      }
    } catch (err) {
      console.error("Error creating saint:", err);
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
      setCreationStep("");
    }
  };

  const filteredSaints = saints.filter((saint) => {
    const matchesSearch =
      saint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      saint.constellation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRank =
      filterRank === "All" || saint.rank.toLowerCase().includes(filterRank.toLowerCase());
    return matchesSearch && matchesRank;
  });

  return (
    <div className="command-container">
      <div className="command-top-bar">
        <button onClick={onBack} className="back-btn">
          ← Home
        </button>
      </div>

      <header className="command-header">
        <h1>Sanctuary Command Center</h1>
        <p>Holy War Roster Operations</p>
      </header>

      {rosterError ? (
        <p className="request-error" role="alert">
          Could not load the roster: {rosterError}
        </p>
      ) : null}
      {!showCreateModal && actionError ? (
        <p className="request-error" role="alert">{actionError}</p>
      ) : null}
      {noticeMessage ? <p className="request-notice" role="status">{noticeMessage}</p> : null}

      {/* War Room entry point */}
      <div
        className="form-card"
        style={{
          borderColor: "#ff4d4d",
          marginBottom: "15px",
          textAlign: "center"
        }}
      >
        <h3 style={{ color: "#ff4d4d", margin: "0 0 6px 0" }}>
          ⚔️ Sanctuary War Room
        </h3>
        <p style={{ color: "#c5c6c7", fontSize: "0.85rem", margin: "0 0 12px 0" }}>
          Defend Athena's Sanctuary, deploy your Saints, and track your campaign.
        </p>
        <button
          onClick={onOpenWar}
          className="btn-primary"
          style={{ padding: "8px 16px", fontSize: "0.85rem" }}
        >
          ⚔️ Enter War Room
        </button>
      </div>

      {showSearch ? (
        <div className="form-card" style={{ marginBottom: "12px", padding: "10px" }}>
          <label htmlFor="saint-search" style={{ display: "block", marginBottom: "6px" }}>
            Search saints by name or armor
          </label>
          <input
            id="saint-search"
            type="search"
            placeholder="Search by name or armor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            autoFocus
          />
        </div>
      ) : null}

      {showFilter ? (
        <div className="form-card" style={{ marginBottom: "12px", padding: "10px" }}>
          <label htmlFor="saint-rank-filter" style={{ display: "block", marginBottom: "6px" }}>
            Filter saints by rank
          </label>
          <div className="form-buttons">
            <select
              id="saint-rank-filter"
              value={filterRank}
              onChange={(e) => setFilterRank(e.target.value)}
              className="form-input"
            >
              <option value="All">All Ranks</option>
              <option value="Bronze">Bronze Saints</option>
              <option value="Silver">Silver Saints</option>
              <option value="Gold">Gold Saints</option>
              <option value="Guard">Generic Guards</option>
            </select>
            {filterRank !== "All" ? (
              <button
                type="button"
                onClick={() => setFilterRank("All")}
                className="btn-secondary"
              >
                Clear Filter
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <h3 style={{ color: "#66fcf1", marginBottom: "8px" }}>
        Active Roster ({filteredSaints.length})
      </h3>

      {/* Scrollable roster */}
      <div className="roster-grid" aria-label="Saint roster">
        {isLoadingSaints ? (
          <LoadingScreen message="Loading Saints..." className="loading-screen-roster" />
        ) : filteredSaints.map((saint) => (
          <div
            key={saint.id}
            className="saint-card"
            onClick={() => onSelectSaint(saint)}
          >
            <img
              src={saint.image?.startsWith("http") || saint.image?.startsWith("/") ? saint.image : `/${saint.image ? saint.image : "Generic-Warrior-1.jpg"}`}
              alt={saint.name}
              className="saint-card-img"
            />
            <h4>{saint.name}</h4>
            <p><strong>Rank:</strong> {saint.rank}</p>
            <p><strong>Armor:</strong> {saint.constellation}</p>
            <p><strong>Status:</strong> <span style={{ color: saint.status === "Injured" ? "#ff4d4d" : "#66fcf1" }}>{saint.status}</span></p>
          </div>
        ))}
        {!isLoadingSaints && !rosterError && filteredSaints.length === 0 ? (
          <p className="roster-message">No Saints match your search or filter.</p>
        ) : null}
      </div>

      {/* Bottom Control Navigation */}
      <div className="command-bottom-nav">
        <button
          onClick={() => {
            setActionError("");
            setNoticeMessage("");
            setShowCreateModal(true);
          }}
          className="nav-pill-btn"
        >
          🛡️ Create Saint
        </button>
        <button onClick={() => setShowSearch((isVisible) => !isVisible)} className="nav-pill-btn">
          {showSearch ? "✕ Close Search" : "🔍 Search"}
        </button>
        <button onClick={() => setShowFilter((isVisible) => !isVisible)} className="nav-pill-btn">
          {showFilter ? "✕ Close Filter" : "⚙️ Filter"}
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal ? (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ color: "#45a29e", marginTop: 0 }}>Create Custom Saint</h3>
            {actionError ? <p className="request-error" role="alert">{actionError}</p> : null}
            {noticeMessage ? <p className="request-notice" role="status">{noticeMessage}</p> : null}
            {isSubmitting ? (
              <p className="request-notice" role="status">{creationStep}</p>
            ) : null}
            <form onSubmit={handleCreateSaint} className="form-grid">
              <input
                type="text"
                placeholder="Saint Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="form-input"
              />
              <select
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                className="form-input"
              >
                <option value="Bronze">Bronze Saint</option>
                <option value="Silver">Silver Saint</option>
                <option value="Gold">Gold Saint</option>
              </select>
              <input
                type="text"
                placeholder="Constellation / Armor"
                value={formData.constellation}
                onChange={(e) => setFormData({ ...formData, constellation: e.target.value })}
                required
                className="form-input"
              />
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="form-input"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <div className="form-buttons" style={{ marginTop: "15px" }}>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Forging Legend..." : "Create Warrior"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

    </div>
  );
}

export default CommandCenter;
