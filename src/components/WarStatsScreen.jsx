import { useEffect, useState } from "react";
import GiveUp from "./GiveUp";
import LoadingScreen from "./LoadingScreen";
import { getEstimatedVictoryChance } from "../assets/battleRules";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";
const CAMPAIGN_WINS_TO_WIN = 3;
const CAMPAIGN_LOSSES_TO_LOSE = 3;

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `The server returned HTTP ${response.status}.`);
  }

  return data;
}

function WarStatsScreen({ saints, setSaints, onBack, onCampaignEnd }) {
  const [campaign, setCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [battles, setBattles] = useState([]);
  const [lastBattle, setLastBattle] = useState(null);
  const [threat, setThreat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    requestJson(`${API_BASE_URL}/api/war/state`)
      .then((data) => {
        if (isCurrent) {
          setCampaign(data.campaign);
          setCampaigns(data.campaigns || []);
          setBattles(data.battles);
        }
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const availableSaints = saints.filter(
    (saint) => saint.status !== "Injured" && saint.status !== "On Mission"
  );
  const totalWins = battles.filter((battle) => battle.result === "victory").length;
  const totalLosses = battles.filter((battle) => battle.result === "defeat").length;
  const latestResult = battles[0]?.result;
  const streakEnd = battles.findIndex((battle) => battle.result !== latestResult);
  const currentStreak = !latestResult ? 0 : streakEnd < 0 ? battles.length : streakEnd;

  const startCampaign = async () => {
    setIsStarting(true);
    setError("");

    try {
      const newCampaign = await requestJson(`${API_BASE_URL}/api/war/campaigns`, {
        method: "POST",
      });
      setCampaign(newCampaign);
      setCampaigns((previousCampaigns) => [
        newCampaign,
        ...previousCampaigns.filter(
          (entry) => String(entry.id) !== String(newCampaign.id)
        ),
      ]);
      setThreat(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsStarting(false);
    }
  };

  const scanForThreat = async () => {
    setIsScanning(true);
    setError("");
    setThreat(null);

    try {
      const generatedThreat = await requestJson(
        `${API_BASE_URL}/api/sanctuary-alert`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignId: campaign.id }),
        }
      );
      setThreat(generatedThreat);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsScanning(false);
    }
  };

  const deploySaint = async (saintId) => {
    if (!campaign || !threat || !saintId || isResolving) {
      return;
    }

    setIsResolving(true);
    setError("");

    try {
      const result = await requestJson(
        `${API_BASE_URL}/api/war/campaigns/${campaign.id}/battles`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ saintId, threat }),
        }
      );

      setCampaign(result.campaign);
      setCampaigns((previousCampaigns) => {
        const campaignExists = previousCampaigns.some(
          (entry) => String(entry.id) === String(result.campaign.id)
        );

        if (!campaignExists) {
          return [result.campaign, ...previousCampaigns];
        }

        return previousCampaigns.map((entry) =>
          String(entry.id) === String(result.campaign.id) ? result.campaign : entry
        );
      });
      setBattles((previousBattles) => [result.battle, ...previousBattles]);
      setLastBattle(result.battle);
      setSaints((previousSaints) =>
        previousSaints.map((saint) =>
          String(saint.id) === String(result.saint.id) ? result.saint : saint
        )
      );
      setThreat(null);
      if (result.campaign.status === "victory" || result.campaign.status === "defeat") {
        onCampaignEnd(result.campaign.status);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsResolving(false);
    }
  };

  const campaignWon = campaign?.status === "victory";

  return (
    <main className="command-container war-screen">
      <div className="command-top-bar">
        <button onClick={onBack} className="back-btn">← Sanctuary</button>
        {campaign?.status === "active" ? (
          <GiveUp
            campaign={campaign}
            onGiveUp={() => onCampaignEnd("defeat")}
          />
        ) : null}
      </div>

      <header className="command-header">
        <h1>War Records</h1>
        <p>Defend Athena's Sanctuary in a finite campaign</p>
      </header>

      {error ? <p className="war-error" role="alert">{error}</p> : null}

      {isLoading ? (
        <LoadingScreen message="Loading war records..." className="loading-screen-fill" />
      ) : (
        <div className="war-content">
          <section className="war-stat-grid" aria-label="All-time war statistics">
            <div className="form-card war-stat-card">
              <span>Total Battles</span>
              <strong>{battles.length}</strong>
            </div>
            <div className="form-card war-stat-card">
              <span>Victories</span>
              <strong className="war-victory-text">{totalWins}</strong>
            </div>
            <div className="form-card war-stat-card">
              <span>Defeats</span>
              <strong className="war-defeat-text">{totalLosses}</strong>
            </div>
            <div className="form-card war-stat-card">
              <span>Current Streak</span>
              <strong>{currentStreak} {latestResult === "victory" ? "W" : latestResult === "defeat" ? "L" : ""}</strong>
            </div>
          </section>

          <section className="form-card war-campaign-card">
            <h2>Campaign</h2>
            {lastBattle ? (
              <div className={`war-battle-report ${lastBattle.result === "victory" ? "war-victory-text" : "war-defeat-text"}`}>
                <h3>{lastBattle.result === "victory" ? "⚔️ Battle Won!" : "💔 Battle Lost"}</h3>
                <p>Victory chance: {lastBattle.victoryChance}%</p>
                {lastBattle.cosmosAwakened ? (
                  <p className="war-cosmos-awakening">✨ COSMOS AWAKENING! The Saint turned the battle around!</p>
                ) : null}
                <p>{lastBattle.explanation}</p>
                <p>
                  Cosmos {lastBattle.cosmosPower}
                  {lastBattle.cosmosAwakened ? ` → ${lastBattle.battleCosmosPower}` : ""}
                  {" vs. threat strength "}
                  {lastBattle.requiredCosmos}
                </p>
              </div>
            ) : null}
            {campaign ? (
              <>
                <p className="war-campaign-score">
                  {campaign.wins} wins · {campaign.losses} losses
                </p>
                <p>
                  First to {CAMPAIGN_WINS_TO_WIN} victories saves the Sanctuary.
                  {` ${CAMPAIGN_LOSSES_TO_LOSE} defeats means the Sanctuary falls.`}
                </p>
                {campaign.status === "active" ? (
                  <>
                    <p>Battle {campaign.battles + 1} of 5 · Campaign in progress</p>
                    {!threat ? (
                      <button
                        type="button"
                        className="btn-primary war-action-button"
                        onClick={scanForThreat}
                        disabled={isScanning || availableSaints.length === 0}
                      >
                        {isScanning ? "Scanning the Sanctuary..." : "🔍 Find Next Threat"}
                      </button>
                    ) : (
                      <div className="war-threat">
                        <div className="war-threat-summary">
                          <h3>⚠️ {threat.enemy}</h3>
                          <p>
                            <strong>Battle {threat.battleNumber} difficulty:</strong>{" "}
                            Required Cosmos {threat.minimumThreatCosmos}–{threat.maximumThreatCosmos}
                          </p>
                          <p><strong>Location:</strong> {threat.location}</p>
                          <p>{threat.description}</p>
                          <p><strong>Required Cosmos:</strong> {threat.requiredCosmos}</p>
                        </div>
                        {saints.length > 0 ? (
                          <>
                            <h4 className="war-saint-list-heading">
                              Choose a Saint to deploy ({availableSaints.length} ready)
                            </h4>
                            <p className="war-odds-note">
                              Victory chances depend on the Cosmos gap. A Saint with lower Cosmos has a 20% chance to awaken.
                            </p>
                            <div className="war-saint-grid">
                              {saints.map((saint) => {
                                const isAvailable =
                                  saint.status !== "Injured" && saint.status !== "On Mission";
                                const image = saint.image?.startsWith("http") || saint.image?.startsWith("/")
                                  ? saint.image
                                  : `/${saint.image || "Generic-Warrior-1.jpg"}`;

                                return (
                                  <article
                                    key={saint.id}
                                    className={`war-saint-card ${!isAvailable ? "war-saint-card-unavailable" : ""}`}
                                  >
                                    <div className="war-saint-info">
                                      <img src={image} alt="" className="war-saint-image" />
                                      <span className="war-saint-name">{saint.name}</span>
                                      <span className="war-saint-rank">{saint.rank} Saint</span>
                                      <span className="war-saint-stat">
                                        Armor: {saint.constellation || "Unknown"}
                                      </span>
                                      <span className="war-saint-stat">
                                        Cosmos: {saint.cosmosPower || 100}
                                      </span>
                                      <span className={`war-saint-status ${isAvailable ? "" : "war-defeat-text"}`}>
                                        {saint.status || "Ready"}
                                      </span>
                                      <span className="war-saint-odds">
                                        Estimated win chance:{" "}
                                        {getEstimatedVictoryChance(
                                          saint.cosmosPower || 100,
                                          threat.requiredCosmos
                                        )}%
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      className="war-saint-deploy-button"
                                      onClick={() => deploySaint(String(saint.id))}
                                      disabled={!isAvailable || isResolving}
                                    >
                                      {!isAvailable
                                        ? "Unavailable"
                                        : isResolving
                                          ? "Resolving battle..."
                                          : "⚔️ Deploy Saint"}
                                    </button>
                                  </article>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <p className="war-defeat-text">
                            No Saints are in the roster yet. Add Saints before defending the Sanctuary.
                          </p>
                        )}
                        <button
                          type="button"
                          className="btn-secondary war-action-button"
                          onClick={() => setThreat(null)}
                          disabled={isResolving}
                        >
                          Cancel threat
                        </button>
                      </div>
                    )}
                    {availableSaints.length === 0 && !threat ? (
                      <p className="war-defeat-text">
                        No Saints are ready. Return to the roster and recover or recall a Saint.
                      </p>
                    ) : null}
                  </>
                ) : (
                  <div className={`war-campaign-result ${campaignWon ? "war-victory-text" : "war-defeat-text"}`}>
                    <h3>{campaignWon ? "🏆 Sanctuary Saved!" : "💔 The Sanctuary Has Fallen"}</h3>
                    <p>
                      {campaignWon
                        ? "Your Saints won three battles and defended Athena's Sanctuary."
                        : "Three defeats ended the campaign. Rally your Saints and try again."}
                    </p>
                    <button
                      type="button"
                      className="btn-primary war-action-button"
                      onClick={startCampaign}
                      disabled={isStarting || availableSaints.length === 0}
                    >
                      {isStarting ? "Preparing campaign..." : "Start New Campaign"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <p>Win three battles before suffering three defeats to save the Sanctuary.</p>
                <button
                  type="button"
                  className="btn-primary war-action-button"
                  onClick={startCampaign}
                  disabled={isStarting || availableSaints.length === 0}
                >
                  {isStarting ? "Preparing campaign..." : "Start Campaign"}
                </button>
                {availableSaints.length === 0 ? (
                  <p className="war-defeat-text">
                    No Saints are ready to deploy. Recover or recall a Saint from the roster first.
                  </p>
                ) : null}
              </>
            )}
          </section>

          <section className="form-card war-history-card">
            <h2>Battle History</h2>
            {battles.length === 0 ? (
              <p>No battles recorded yet. Start a campaign to defend the Sanctuary.</p>
            ) : (
              <ol className="war-battle-list">
                {battles.slice(0, 20).map((battle) => {
                  const saint = saints.find(
                    (entry) => String(entry.id) === String(battle.saintId)
                  );
                  const relatedCampaign = campaigns.find(
                    (entry) => String(entry.id) === String(battle.campaignId)
                  );
                  const saintName = saint?.name || battle.saintName || "Unknown Saint";
                  const campaignSummary = relatedCampaign
                    ? `${relatedCampaign.status} · ${relatedCampaign.wins}W/${relatedCampaign.losses}L`
                    : "Campaign record unavailable";

                  return (
                    <li key={battle.id} className="war-battle-entry">
                      <span className={battle.result === "victory" ? "war-victory-text" : "war-defeat-text"}>
                        {battle.result === "victory" ? "VICTORY" : "DEFEAT"}
                      </span>
                      <strong>{saintName} vs. {battle.enemy}</strong>
                      {saint ? (
                        <span className="war-battle-relation">
                          Saint record: {saint.rank || "Rank not recorded"}
                        </span>
                      ) : null}
                      <span>
                        Campaign: {campaignSummary}
                        {relatedCampaign?.createdAt
                          ? ` · started ${new Date(relatedCampaign.createdAt).toLocaleDateString()}`
                          : ""}
                      </span>
                      {battle.cosmosAwakened ? (
                        <span className="war-cosmos-awakening">✨ Cosmos Awakening!</span>
                      ) : null}
                      <span>
                        {battle.location} · Cosmos {battle.cosmosPower}
                        {battle.cosmosAwakened ? ` → ${battle.battleCosmosPower}` : ""}
                        /{battle.requiredCosmos}
                      </span>
                      {typeof battle.victoryChance === "number" ? (
                        <span>Estimated win chance: {battle.victoryChance}%</span>
                      ) : null}
                      {battle.battleNumber ? <span>Campaign battle {battle.battleNumber}</span> : null}
                      <small>{new Date(battle.createdAt).toLocaleString()}</small>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default WarStatsScreen;
