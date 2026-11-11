import { useEffect, useState } from "react";
import { generateSaintLore } from "../assets/gemini";
import { requestApi } from "../assets/api";
import { getCustomSaintImage, getSaintImage } from "../assets/saintImages";

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
  const canEdit = saint.isCustom === true;
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

    if (!canEdit) {
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
      setComments(updated.comments ?? comments);
    } catch (err) {
      console.error("Error saving comments:", err);
      setCommentsError(err.message);
    } finally {
      setIsSavingComments(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!canEdit) {
      return;
    }

    setIsActionLoading(true);
    setActionMessage("Saving warrior changes...");
    setActionError("");

    const newRankFull = `${formData.rank} Saint`;
    const hiddenCosmosPower =
      formData.rank === "Gold" ? 250 : formData.rank === "Silver" ? 160 : 115;
    const newImage = saint.isCustom
      ? getCustomSaintImage(saint.gender)
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
            status: saint.status || "Active",
            image: newImage,
            gender: saint.gender,
            comments: saint.comments || "",
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
    if (!canEdit) {
      return;
    }

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
    <div className="command-container saint-detail-screen">
      <div className="command-top-bar" style={{ justifyContent: "flex-start" }}>
        <button onClick={onBack} className="btn btn-primary btn-sm">
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

      {isActionLoading ? (
        <div className="form-card saint-action-status" role="status">
          <p>⏳ {actionMessage}</p>
          <p>Please wait, contacting the server...</p>
        </div>
      ) : null}

      <div className="saint-detail-content">
        <section className="saint-detail-profile" aria-label="Saint profile">
          <div className="form-card saint-heading-card">
            <h2>{saint.name}</h2>
            <span
              className={`saint-rank-label saint-rank-${(saint.rank || "bronze").toLowerCase().split(" ")[0]}`}
            >
              {saint.rank}
            </span>
          </div>

          <div className="form-card saint-stats-card">
            <div className="saint-detail-portrait-frame">
              <img
                src={getSaintImage(saint)}
                alt={saint.name}
                className="saint-detail-portrait saint-cosmos-portrait"
              />
            </div>

            <div className="saint-detail-stats">
              <div>
                <strong className="saint-stat-label">
                  Constellation:
                </strong>{" "}
                {saint.constellation}
              </div>
              <div>
                <strong className="saint-stat-label">Cosmos Power:</strong>{" "}
                <span style={{ color: "var(--gold)", fontWeight: "bold" }}>
                  {saint.cosmosPower ? saint.cosmosPower : "N/A"}
                </span>
              </div>
              {saint.status && saint.status !== "Ready" ? (
                <div>
                  <strong className="saint-stat-label">Status:</strong>{" "}
                  <span
                    style={{
                      color:
                        saint.status === "Injured"
                          ? "var(--danger)"
                          : "var(--silver-bright)",
                      fontWeight: "bold",
                    }}
                  >
                    {saint.status}
                  </span>
                  {saint.status === "Injured" &&
                  recoveryMilliseconds !== null ? (
                    <span className="saint-recovery-time">
                      {recoveryMilliseconds > 0
                        ? ` · Healing: ${formatRecoveryTime(recoveryMilliseconds)}`
                        : " · Recovery complete"}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="saint-detail-records" aria-label="Saint lore and notes">
          <div className="form-card saint-lore-card">
            <div className="saint-lore-header">
              <h4 style={{ color: "var(--gold)", margin: 0 }}>
                Saint Lore & History
              </h4>
              <button
                onClick={handleGenerateLore}
                className="btn btn-accent btn-sm"
                disabled={isGeneratingLore}
                style={{ fontSize: "0.95rem", padding: "4px 8px" }}
              >
                {isGeneratingLore
                  ? "Consulting..."
                  : !canEdit
                    ? showLore
                      ? "Hide Canon"
                      : "View Canon"
                    : showLore
                      ? "Hide Lore"
                      : "Reveal Lore"}
              </button>
            </div>

            {isGeneratingLore ? (
              <div className="saint-lore-loading">
                <p>Consulting the Groq Sanctuary Oracle...</p>
                <p>Reading constellation memories from ancient history...</p>
              </div>
            ) : showLore && (lore || saint.lore) ? (
              <p className="saint-lore-text">"{lore || saint.lore}"</p>
            ) : null}

            {loreError ? (
              <p className="saint-lore-error" role="alert">
                {loreError}
              </p>
            ) : null}
          </div>

          <div className="form-card saint-notes-card">
            <h4 style={{ color: "var(--bronze-bright)", margin: "0 0 8px 0" }}>
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
              disabled={isSavingComments}
              className="form-input saint-notes-input"
            />
            <div className="saint-notes-actions">
              <div
                className="saint-notes-status"
                role="status"
                aria-live="polite"
              >
                {isSavingComments ? (
                  "Saving notes..."
                ) : commentsError ? (
                  <span className="request-error-text" role="alert">
                    {commentsError}
                  </span>
                ) : comments !== (saint.comments || "") ? (
                  "Unsaved changes"
                ) : null}
              </div>
              <button
                type="button"
                onClick={handleSaveComments}
                className="btn btn-primary btn-sm"
                disabled={
                  isSavingComments || comments === (saint.comments || "")
                }
              >
                {isSavingComments ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Pinned Bottom Navigation Action Bar */}
      <div
        className="command-bottom-nav saint-detail-actions"
        style={{ marginTop: "auto", paddingTop: "5px" }}
      >
        {canEdit ? (
          <button
            type="button"
            onClick={() => {
              setFormData({
                rank: saint.rank ? saint.rank.replace(" Saint", "") : "Bronze",
              });
              setShowEditModal(true);
            }}
            className="btn btn-primary btn-sm"
            disabled={isActionLoading}
          >
            Edit
          </button>
        ) : null}

        {canEdit ? (
          <button
            type="button"
            onClick={handleDelete}
            className="btn btn-danger btn-sm"
            disabled={isActionLoading}
          >
            RIP
          </button>
        ) : null}
      </div>

      {showEditModal && canEdit ? (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ color: "var(--bronze-bright)", marginTop: 0 }}>
              Edit Warrior Rank
            </h3>
            <form onSubmit={handleSaveEdit} className="form-grid">
              <div>
                <label
                  style={{
                    fontSize: "1rem",
                    color: "var(--silver)",
                    display: "block",
                    marginBottom: "4px",
                    fontWeight: 600,
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

              <div className="form-buttons" style={{ marginTop: "15px" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isActionLoading}
                >
                  {isActionLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
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
