import React, { useState, useEffect, useRef } from "react";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5005"}/saints`;
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";

function CommandCenter({ onBack, onSelectSaint }) {
  const [saints, setSaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRank, setSelectedRank] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [formData, setFormData] = useState({
    name: "",
    rank: "Bronze",
    constellation: "",
    gender: "Male",
    status: "Active"
  });

  const scrollContainerRef = useRef(null);
  const isHoveredRef = useRef(false);

  const fetchSaints = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setSaints(data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching saints:", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSaints();
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollDirection = 1;
    let animationFrameId;
    let pauseCounter = 0;

    const autoScroll = () => {
      if (!isHoveredRef.current && container) {
        if (pauseCounter > 0) {
          pauseCounter--;
        } else {
          container.scrollTop += 0.5 * scrollDirection;

          if (container.scrollTop + container.clientHeight >= container.scrollHeight - 2) {
            scrollDirection = -1;
            pauseCounter = 60;
          } else if (container.scrollTop <= 0) {
            scrollDirection = 1;
            pauseCounter = 60;
          }
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [saints]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const loreRes = await fetch(`${API_BASE_URL}/api/generate-lore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saintName: formData.name,
          rank: formData.rank,
          constellation: formData.constellation,
          gender: formData.gender,
          isCustom: true
        })
      });

      const loreData = await loreRes.json();
      const generatedLore = loreRes.ok ? loreData.lore : "A dedicated warrior sworn to Athena's Sanctuary.";
      const generatedImage = loreRes.ok && loreData.image ? loreData.image : "/Generic-Warrior-1.jpg";

      const newSaintPayload = {
        name: formData.name,
        rank: `${formData.rank} Saint`,
        constellation: formData.constellation,
        cosmosPower: formData.rank === "Gold" ? 250 : formData.rank === "Silver" ? 160 : 115,
        status: formData.status,
        image: generatedImage,
        gender: formData.gender,
        isCustom: true,
        lore: generatedLore
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSaintPayload)
      });
      const newSaint = await res.json();
      setSaints([...saints, newSaint]);
      setIsSubmitting(false);
      setShowFormModal(false);
      setFormData({
        name: "",
        rank: "Bronze",
        constellation: "",
        gender: "Male",
        status: "Active"
      });
    } catch (err) {
      console.error("Error creating saint:", err);
      setIsSubmitting(false);
    }
  };

  const handleSelectSaint = (saint) => {
    onSelectSaint(saint);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedRank("All");
    setSelectedStatus("All");
  };

  const filteredSaints = saints.filter((saint) => {
    const cleanQuery = searchQuery.trim().toLowerCase();
    const cleanName = (saint.name || "").toLowerCase();
    const matchesSearch = cleanName.includes(cleanQuery);

    const matchesRank = selectedRank === "All" || (saint.rank || "").includes(selectedRank);
    const matchesStatus = selectedStatus === "All" || (saint.status || "") === selectedStatus;

    return matchesSearch && matchesRank && matchesStatus;
  });

  const isFilterActive = searchQuery || selectedRank !== "All" || selectedStatus !== "All";

  return (
    <div className="command-container">
      <div className="command-top-bar">
        <button onClick={onBack} className="back-btn" style={{ margin: 0 }}>
          ← Home
        </button>
        <div className="menu-icon">☰ Menu</div>
      </div>

      <header className="command-header">
        <h1>Sanctuary Command Center</h1>
        <p>Holy War Roster Operations</p>
      </header>

      <div className="alert-banner" onClick={() => alert("Alert clicked! Random gameplay event triggered.")}>
        <h4>⚠️ Sanctuary Alert Active</h4>
        <p>Cosmic disturbance detected in the Sanctuary. Tap for details.</p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h3 style={{ color: "#66fcf1", fontSize: "1rem", margin: 0 }}>
          Active Roster ({filteredSaints.length})
        </h3>
        {isFilterActive ? (
          <button 
            onClick={clearAllFilters} 
            style={{ background: "transparent", border: "none", color: "#ff4d4d", fontSize: "0.8rem", cursor: "pointer", fontWeight: "bold" }}
          >
            Clear Filters
          </button>
        ) : null}
      </div>

      {showSearchInput ? (
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Search warrior by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            autoFocus
          />
        </div>
      ) : null}

      {showFilterBar ? (
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px", background: "#1f2833", padding: "10px", borderRadius: "6px", border: "1px solid #45a29e" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "0.75rem", color: "#c5c6c7", display: "block", marginBottom: "4px" }}>Rank:</label>
            <select 
              value={selectedRank} 
              onChange={(e) => setSelectedRank(e.target.value)} 
              className="form-input"
              style={{ padding: "4px 8px" }}
            >
              <option value="All">All Ranks</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Bronze">Bronze</option>
              <option value="Guard">Guard</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "0.75rem", color: "#c5c6c7", display: "block", marginBottom: "4px" }}>Status:</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)} 
              className="form-input"
              style={{ padding: "4px 8px" }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Ready">Ready</option>
              <option value="Injured">Injured</option>
              <option value="On Mission">On Mission</option>
            </select>
          </div>
        </div>
      ) : null}

      <div 
        ref={scrollContainerRef}
        onMouseEnter={() => (isHoveredRef.current = true)}
        onMouseLeave={() => (isHoveredRef.current = false)}
        className="scrollable-roster-container"
      >
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#66fcf1" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>⏳</div>
            <p style={{ fontWeight: "bold", margin: "0 0 5px 0" }}>Waking up Sanctuary Server...</p>
            <p style={{ fontSize: "0.85rem", color: "#c5c6c7", margin: 0 }}>
              Free hosting servers go to sleep when idle. Charging Cosmos energy, please hold!
            </p>
          </div>
        ) : filteredSaints.length === 0 ? (
          <p style={{ textAlign: "center", color: "#c5c6c7", padding: "20px 0" }}>
            No warriors found matching your criteria.
          </p>
        ) : (
          <div className="roster-grid">
            {filteredSaints.map((saint) => (
              <div 
                key={saint.id} 
                className="saint-card" 
                onClick={() => handleSelectSaint(saint)}
                style={{ cursor: "pointer" }}
              >
                <div className="saint-card-img">
                  <img
                    src={saint.image?.startsWith("http") || saint.image?.startsWith("/") ? saint.image : `/${saint.image}`}
                    alt={saint.name}
                  />
                </div>
                <h4>{saint.name}</h4>
                <p><strong>Rank:</strong> {saint.rank ? saint.rank : "Unknown"}</p>
                <p style={{ marginBottom: "4px" }}><strong>Armor:</strong> {saint.constellation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="command-bottom-nav">
        <button onClick={() => setShowFormModal(true)} className="nav-pill-btn">
          🛡️ Create Saint
        </button>
        <button 
          onClick={() => setShowSearchInput(!showSearchInput)} 
          className="nav-pill-btn"
          style={{ backgroundColor: showSearchInput ? "#45a29e" : "#1f2833", color: showSearchInput ? "#0b0c10" : "#66fcf1" }}
        >
          🔍 Search
        </button>
        <button 
          onClick={() => setShowFilterBar(!showFilterBar)} 
          className="nav-pill-btn"
          style={{ backgroundColor: showFilterBar ? "#45a29e" : "#1f2833", color: showFilterBar ? "#0b0c10" : "#66fcf1" }}
        >
          ⚙️ Filter
        </button>
      </div>

      {showFormModal ? (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ color: "#45a29e", marginTop: 0 }}>Create Saint</h3>
            <form onSubmit={handleSubmit} className="form-grid">
              <input
                type="text"
                name="name"
                placeholder="Saint Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
              />
              <select name="rank" value={formData.rank} onChange={handleChange} className="form-input">
                <option value="Bronze">Bronze Saint</option>
                <option value="Silver">Silver Saint</option>
                <option value="Gold">Gold Saint</option>
              </select>
              <select name="gender" value={formData.gender} onChange={handleChange} className="form-input">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                name="constellation"
                placeholder="Constellation / Armor (e.g., Dog, Pegasus)"
                value={formData.constellation}
                onChange={handleChange}
                required
                className="form-input"
              />
              <select name="status" value={formData.status} onChange={handleChange} className="form-input">
                <option value="Active">Active</option>
                <option value="Ready">Ready</option>
                <option value="Injured">Injured</option>
                <option value="On Mission">On Mission</option>
              </select>

              <div className="form-buttons" style={{ marginTop: "15px" }}>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Summoning & Forging Armor..." : "Create Saint"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowFormModal(false)} 
                  className="btn-secondary"
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
