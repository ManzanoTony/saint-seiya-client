import { useEffect, useState } from "react";
import { generateSaintLore } from "../assets/gemini";
import { requestApi } from "../assets/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";
const API_URL = `${API_BASE_URL}/saints`;

function formatRecoveryTime(milliseconds) {
  const totalSeconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function SaintDetailScreen({
  saint,
  loadError,
  onBack,
  onUpdateSaint,
  onDeleteSaint,
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [comments, setComments] = useState(saint.comments || "");
  const [lore, setLore] = useState("");
  const [showLore, setShowLore] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isGeneratingLore, setIsGeneratingLore] = useState(false);
  const [loreError, setLoreError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [commentsError, setCommentsError] = useState("");
  const [isSavingComments, setIsSavingComments] = useState(false);

  const [formData, setFormData] = useState(() => ({
    rank: saint.rank ? saint.rank.replace(" Saint", "") : "Bronze",
    status: saint.status || "Active",
  }));

  useEffect(() => {
    if (saint.status !== "Injured") {
      return undefined;
    }

    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [saint.status]);

  const recoveryMilliseconds =
    currentTime && saint.recoveryUntil
      ? Date.parse(saint.recoveryUntil) - currentTime
      : null;

  const handleGenerateLore = async () => {
    if (showLore) {
      setShowLore(false);
      return;
    }

    if (saint.isCustom === false) {
      setLore(saint.lore || "Manga canon history recording...");
      setShowLore(true);
      return;
    }

    if (saint.lore && saint.lore.trim() !== "") {
      setLore(saint.lore);
      setShowLore(true);
      return;
    }

    setIsGeneratingLore(true);
    setLoreError("");

    try {
      const generatedText = await generateSaintLore(
        saint.name,
        saint.rank,
        saint.constellation,
      );
      setLore(generatedText);
      setShowLore(true);

      const updatedSaint = await requestApi(
        `${API_URL}/${saint.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lore: generatedText }),
        },
        "Lore was generated but could not be saved.",
      );
      onUpdateSaint(updatedSaint);
    } catch (err) {
      console.error("Error generating lore:", err);
      setLoreError(
        err.message ||
          "Could not generate the lore. Please check the server and Groq API configuration.",
      );
    } finally {
      setIsGeneratingLore(false);
    }
  };

  const handleSaveComments = async () => {
    if (comments === (saint.comments || "")) {
      return;
    }

    setIsSavingComments(true);
    setCommentsError("");

    try {
      const updated = await requestApi(
        `${API_URL}/${saint.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comments }),
        },
        "Could not save Sanctuary notes.",
      );
      onUpdateSaint(updated);
    } catch (err) {
      console.error("Error saving comments:", err);
      setCommentsError(err.message);
    } finally {
      setIsSavingComments(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsActionLoading(true);
    setActionMessage("Saving warrior changes...");
    setActionError("");

    const newRankFull = `${formData.rank} Saint`;
    const statusToSave =
      saint.status === "Injured"
        ? "Injured"
        : formData.status === "Injured"
          ? saint.status
          : formData.status;
    const hiddenCosmosPower =
      formData.rank === "Gold" ? 250 : formData.rank === "Silver" ? 160 : 115;
    const newImage = saint.isCustom
      ? formData.rank === "Gold"
        ? "/Saga.png"
        : formData.rank === "Silver"
          ? "/Marin.png"
          : "/Seiya.png"
      : saint.image;

    try {
      let updatedLore = saint.lore;
      const rankChanged = saint.rank !== newRankFull;

      if (saint.isCustom && rankChanged) {
        setActionMessage(
          "Rank changed! Forging new legend with the Sanctuary Oracle...",
        );
        updatedLore = await generateSaintLore(
          saint.name,
          newRankFull,
          saint.constellation,
        );
        setLore(updatedLore);
      }

      const updated = await requestApi(
        `${API_URL}/${saint.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: saint.name,
            rank: newRankFull,
            constellation: saint.constellation,
            cosmosPower: hiddenCosmosPower,
            status: statusToSave,
            image: newImage,
            gender: saint.gender,
            comments: comments,
            lore: updatedLore,
            isCustom: saint.isCustom,
          }),
        },
        "Could not update Saint.",
      );
      onUpdateSaint(updated);
      setIsActionLoading(false);
      setActionMessage("");
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating saint details:", err);
      setActionError(err.message);
    } finally {
      setIsActionLoading(false);
      setActionMessage("");
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to send ${saint.name} to rest in peace?`,
    );

    if (confirmed) {
      setIsActionLoading(true);
      setActionMessage("Sending warrior to rest in peace...");
      setActionError("");

      try {
        await requestApi(
          `${API_URL}/${saint.id}`,
          { method: "DELETE" },
          "Could not delete Saint.",
        );
        onDeleteSaint(saint.id);
      } catch (err) {
        console.error("Error deleting saint:", err);
        setActionError(err.message);
      } finally {
        setIsActionLoading(false);
        setActionMessage("");
      }
    }
  };

  return (
    <div className="command-container">
      <div className="command-top-bar" style={{ justifyContent: "flex-start" }}>
        <button onClick={onBack} className="back-btn" style={{ margin: 0 }}>
          ← Back to Roster
        </button>
      </div>

      <header className="command-header">
        <h1>Selected Saint Details</h1>
        <p>Warrior Tactical Overview & Command</p>
      </header>

      {loadError ? (
        <p className="request-error" role="alert">
          Could not refresh Saint records: {loadError}
        </p>
      ) : null}
      {actionError ? (
        <p className="request-error" role="alert">
          {actionError}
        </p>
      ) : null}

      {/* Scrollable Content Wrapper with Always-Reserved Scrollbar Space */}
      <div className="saint-detail-content">
        {isActionLoading ? (
          <div
            className="form-card"
            style={{
              textAlign: "center",
              borderColor: "#66fcf1",
              marginBottom: "15px",
            }}
          >
            <p
              style={{
                color: "#66fcf1",
                fontWeight: "bold",
                margin: "0 0 5px 0",
              }}
            >
              ⏳ {actionMessage}
            </p>
            <p style={{ fontSize: "0.8rem", color: "#c5c6c7", margin: 0 }}>
              Please wait, contacting the server...
            </p>
          </div>
        ) : null}

        <div
          className="form-card saint-heading-card"
          style={{ textAlign: "center", marginBottom: "15px" }}
        >
          <h2 style={{ color: "#66fcf1", margin: "0 0 5px 0" }}>
            {saint.name}
          </h2>
          <span
            style={{
              background: "#45a29e",
              color: "#0b0c10",
              padding: "4px 12px",
              borderRadius: "12px",
              fontWeight: "bold",
              fontSize: "0.85rem",
            }}
          >
            {saint.rank}
          </span>
        </div>

        <div
          className="form-card saint-stats-card"
          style={{ marginBottom: "15px" }}
        >
          <div style={{ textAlign: "center", marginBottom: "15px" }}>
            <img
              src={
                saint.image?.startsWith("http") || saint.image?.startsWith("/")
                  ? saint.image
                  : `/${saint.image ? saint.image : "Generic-Warrior-1.jpg"}`
              }
              alt={saint.name}
              style={{
                maxHeight: "180px",
                width: "100%",
                objectFit: "contain",
                borderRadius: "8px",
                background: "#0b0c10",
                padding: "5px",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              color: "#c5c6c7",
              fontSize: "0.9rem",
            }}
          >
            <div>
              <strong>Armor / Constellation:</strong> {saint.constellation}
            </div>
            <div>
              <strong>Cosmos Power:</strong>{" "}
              <span style={{ color: "#66fcf1", fontWeight: "bold" }}>
                {saint.cosmosPower ? saint.cosmosPower : "N/A"}
              </span>
            </div>
            <div>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color: saint.status === "Injured" ? "#ff4d4d" : "#66fcf1",
                  fontWeight: "bold",
                }}
              >
                {saint.status}
              </span>
              {saint.status === "Injured" && recoveryMilliseconds !== null ? (
                <span className="saint-recovery-time">
                  {recoveryMilliseconds > 0
                    ? ` · Healing: ${formatRecoveryTime(recoveryMilliseconds)}`
                    : " · Recovery complete"}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Stable-width Lore & History Card */}
        <div className="form-card saint-lore-card">
          <div className="saint-lore-header">
            <h4 style={{ color: "#66fcf1", margin: 0 }}>
              Saint Lore & History
            </h4>
            <button
              onClick={handleGenerateLore}
              className="btn-edit"
              disabled={isGeneratingLore}
              style={{ fontSize: "0.75rem", padding: "4px 8px" }}
            >
              {isGeneratingLore
                ? "Consulting..."
                : saint.isCustom === false
                  ? showLore
                    ? "Hide Canon"
                    : "View Canon"
                  : showLore
                    ? "Hide Lore"
                    : "Reveal Lore"}
            </button>
          </div>

          {isGeneratingLore ? (
            <div
              style={{
                textAlign: "center",
                padding: "15px 0",
                color: "#66fcf1",
                marginTop: "8px",
              }}
            >
              <p style={{ fontWeight: "bold", margin: "0 0 4px 0" }}>
                Consulting the Groq Sanctuary Oracle...
              </p>
              <p style={{ fontSize: "0.80rem", color: "#c5c6c7", margin: 0 }}>
                Reading constellation memories from ancient history...
              </p>
            </div>
          ) : showLore && (lore || saint.lore) ? (
            <p className="saint-lore-text">"{lore || saint.lore}"</p>
          ) : null}

          {loreError ? (
            <p
              role="alert"
              style={{
                color: "#ff8080",
                fontSize: "0.85rem",
                margin: "8px 0 0",
              }}
            >
              {loreError}
            </p>
          ) : null}
        </div>

        <div
          className="form-card saint-notes-card"
          style={{
            marginBottom: "10px",
            boxSizing: "border-box",
            width: "100%",
          }}
        >
          <h4 style={{ color: "#45a29e", margin: "0 0 8px 0" }}>
            Sanctuary Notes & Tactical Comments
          </h4>
          <textarea
            rows="3"
            placeholder="Type notes or strategy for this warrior..."
            value={comments}
            onChange={(e) => {
              setComments(e.target.value);
              setCommentsError("");
            }}
            onBlur={handleSaveComments}
            className="form-input"
            style={{
              width: "100%",
              resize: "vertical",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              fontSize: "0.75rem",
              color: "#45a29e",
              marginTop: "4px",
              textAlign: "right",
            }}
          >
            {isSavingComments ? (
              "Saving notes..."
            ) : commentsError ? (
              <span className="request-error-text" role="alert">
                {commentsError}
              </span>
            ) : (
              "Saves automatically when clicking outside text box"
            )}
          </div>
        </div>
      </div>

      {/* Pinned Bottom Navigation Action Bar */}
      <div
        className="command-bottom-nav saint-detail-actions"
        style={{ marginTop: "auto", paddingTop: "5px" }}
      >
        <button
          onClick={() => {
            setFormData({
              rank: saint.rank ? saint.rank.replace(" Saint", "") : "Bronze",
              status: saint.status || "Active",
            });
            setShowEditModal(true);
          }}
          className="nav-pill-btn saint-edit-button"
          disabled={isActionLoading}
        >
          Edit
        </button>

        {saint.isCustom ? (
          <button
            onClick={handleDelete}
            className="nav-pill-btn"
            style={{ borderColor: "#ff4d4d", color: "#ff4d4d" }}
            disabled={isActionLoading}
          >
            Send to Rest in Peace
          </button>
        ) : null}
      </div>

      {showEditModal ? (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ color: "#45a29e", marginTop: 0 }}>
              Edit Warrior Rank & Status
            </h3>
            <form onSubmit={handleSaveEdit} className="form-grid">
              <div>
                <label
                  style={{
                    fontSize: "0.75rem",
                    color: "#c5c6c7",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Rank:
                </label>
                <select
                  name="rank"
                  value={formData.rank}
                  onChange={(e) =>
                    setFormData({ ...formData, rank: e.target.value })
                  }
                  className="form-input"
                >
                  <option value="Bronze">Bronze Saint</option>
                  <option value="Silver">Silver Saint</option>
                  <option value="Gold">Gold Saint</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "0.75rem",
                    color: "#c5c6c7",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Status:
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="form-input"
                  disabled={isActionLoading || saint.status === "Injured"}
                >
                  <option value="Active">Active</option>
                  <option value="Ready">Ready</option>
                  {saint.status === "Injured" ? (
                    <option value="Injured">Injured (Healing)</option>
                  ) : (
                    <option value="Injured">Injured (1 minute recovery)</option>
                  )}
                  <option value="On Mission">On Mission</option>
                </select>
                {saint.status === "Injured" ? (
                  <p className="saint-recovery-help">
                    {recoveryMilliseconds === null
                      ? "This Saint is healing."
                      : recoveryMilliseconds > 0
                        ? `Healing — Ready in ${formatRecoveryTime(recoveryMilliseconds)}.`
                        : "Recovery is complete. The Saint will be Ready shortly."}
                  </p>
                ) : null}
              </div>

              <div className="form-buttons" style={{ marginTop: "15px" }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isActionLoading}
                >
                  {isActionLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                  disabled={isActionLoading}
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

export default SaintDetailScreen;
