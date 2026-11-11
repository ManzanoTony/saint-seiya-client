import { useState, useEffect } from "react";
import { requestApi } from "../assets/api";
import LoadingScreen from "./LoadingScreen";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";
const API_URL = `${API_BASE_URL}/saints`;

function CommandCenter({
  saints,
  setSaints,
  onBack,
  onOpenWar,
  onSelectSaint,
}) {
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
    gender: "Male",
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
    const defaultPower =
      formData.rank === "Gold" ? 250 : formData.rank === "Silver" ? 160 : 115;
    const defaultImage =
      formData.rank === "Gold"
        ? "/Saga.png"
        : formData.rank === "Silver"
          ? "/Marin.png"
          : "/Seiya.png";

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
            isCustom: true,
          }),
        },
        "Could not generate Saint lore.",
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
      isCustom: true,
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
        "Could not create Saint.",
      );
      setSaints((prev) => [...prev, created]);
      setFormData({
        name: "",
        rank: "Bronze",
        constellation: "",
        gender: "Male",
      });
      setShowCreateModal(false);
      if (loreWarning) {
        setNoticeMessage(
          `${loreWarning} The Saint was created; you can reveal lore later.`,
        );
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
      filterRank === "All" ||
      saint.rank.toLowerCase().includes(filterRank.toLowerCase());
    return matchesSearch && matchesRank;
  });

  return (
    <main className="roster-screen">
      {/* Top Bar */}
      <div className="roster-topbar">
        <button onClick={onBack} className="btn btn-ghost btn-sm text-warning">
          ← Home
        </button>
      </div>

      {/* Header */}
      <header className="roster-header">
        <h1>
          Sanctuary Command Center
        </h1>
        <p>Holy War Roster Operations</p>
      </header>

      {/* Error & Notice Banners */}
      {rosterError ? (
        <div className="alert alert-error mb-4 shadow-lg text-sm" role="alert">
          <span>Could not load the roster: {rosterError}</span>
        </div>
      ) : null}
      {!showCreateModal && actionError ? (
        <div className="alert alert-error mb-4 shadow-lg text-sm" role="alert">
          <span>{actionError}</span>
        </div>
      ) : null}
      {noticeMessage ? (
        <div className="alert alert-info mb-4 shadow-lg text-sm" role="status">
          <span>{noticeMessage}</span>
        </div>
      ) : null}

      {/* War Room entry point */}
      <div className="card roster-war-entry">
        <h2>
          Sanctuary War Room
        </h2>
        <p>
          Defend Athena's Sanctuary, deploy your Saints, and track your campaign.
        </p>
        <div>
          <button onClick={onOpenWar} className="btn btn-error btn-sm">
            Enter War Room
          </button>
        </div>
      </div>

      {/* Search Input Box */}
      {showSearch ? (
        <div className="card roster-filter-card">
          <label
            htmlFor="saint-search"
            className="form-label"
          >
            Search saints by name or armor
          </label>
          <input
            id="saint-search"
            type="search"
            placeholder="Search by name or armor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
            autoFocus
          />
        </div>
      ) : null}

      {/* Filter Options */}
      {showFilter ? (
        <div className="card roster-filter-card">
          <label
            htmlFor="saint-rank-filter"
            className="form-label"
          >
            Filter saints by rank
          </label>
          <div className="roster-filter-row">
            <select
              id="saint-rank-filter"
              value={filterRank}
              onChange={(e) => setFilterRank(e.target.value)}
              className="select"
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
                className="btn btn-outline btn-warning btn-sm"
              >
                Clear Filter
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <h2 className="roster-list-heading">
        Active Roster ({filteredSaints.length})
      </h2>

      {/* Scrollable roster */}
      <div
        className="roster-grid"
        aria-label="Saint roster"
      >
        {isLoadingSaints ? (
          <div className="col-span-full">
            <LoadingScreen
              message="Loading Saints..."
              className="loading-screen-roster"
            />
          </div>
        ) : (
          filteredSaints.map((saint) => (
            <div
              key={saint.id}
              onClick={() => onSelectSaint(saint)}
              className="card roster-saint-card"
            >
              <img
                src={
                  saint.image?.startsWith("http") ||
                  saint.image?.startsWith("/")
                    ? saint.image
                    : `/${saint.image ? saint.image : "Generic-Warrior-1.jpg"}`
                }
                alt={saint.name}
                className="roster-saint-image"
              />
              <div className="roster-saint-info">
                <h3>{saint.name}</h3>
                <p>
                  <strong>Rank:</strong> {saint.rank}
                </p>
                <p>
                  <strong>Armor:</strong> {saint.constellation}
                </p>
                <p>
                  <span
                    className={`badge ${
                      saint.status === "Injured"
                        ? "badge-error"
                        : "badge-success"
                    }`}
                  >
                    {saint.status}
                  </span>
                </p>
              </div>
            </div>
          ))
        )}
        {!isLoadingSaints && !rosterError && filteredSaints.length === 0 ? (
          <p className="roster-empty-state">
            No Saints match your search or filter.
          </p>
        ) : null}
      </div>

      {/* Bottom Control Navigation */}
      <div className="roster-footer-nav">
        <button
          onClick={() => {
            setActionError("");
            setNoticeMessage("");
            setShowCreateModal(true);
          }}
          className="btn btn-outline btn-sm"
        >
          Create Saint
        </button>
        <button
          onClick={() => setShowSearch((isVisible) => !isVisible)}
          className="btn btn-outline btn-sm"
        >
          {showSearch ? "Close Search" : "Search"}
        </button>
        <button
          onClick={() => setShowFilter((isVisible) => !isVisible)}
          className="btn btn-outline btn-sm"
        >
          {showFilter ? "Close Filter" : "Filter"}
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal ? (
        <div className="roster-modal">
          <div className="roster-modal-box">
            <h2>
              Create Custom Saint
            </h2>
            {actionError ? (
              <div className="alert alert-error mb-3 text-xs" role="alert">
                <span>{actionError}</span>
              </div>
            ) : null}
            {noticeMessage ? (
              <div className="alert alert-info mb-3 text-xs" role="status">
                <span>{noticeMessage}</span>
              </div>
            ) : null}
            {isSubmitting ? (
              <div className="alert alert-warning mb-3 text-xs" role="status">
                <span>{creationStep}</span>
              </div>
            ) : null}
            <form onSubmit={handleCreateSaint} className="roster-create-form">
              <input
                type="text"
                placeholder="Saint Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="input"
              />
              <select
                value={formData.rank}
                onChange={(e) =>
                  setFormData({ ...formData, rank: e.target.value })
                }
                className="select"
              >
                <option value="Bronze">Bronze Saint</option>
                <option value="Silver">Silver Saint</option>
                <option value="Gold">Gold Saint</option>
              </select>
              <input
                type="text"
                placeholder="Constellation / Armor"
                value={formData.constellation}
                onChange={(e) =>
                  setFormData({ ...formData, constellation: e.target.value })
                }
                required
                className="input"
              />
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="select"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <div className="roster-modal-actions">
                <button
                  type="submit"
                  className="btn btn-warning btn-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Forging Legend..." : "Create Warrior"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-ghost btn-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default CommandCenter;
