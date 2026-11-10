import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";

function GiveUp({ campaign, onGiveUp }) {
  const [isGivingUp, setIsGivingUp] = useState(false);
  const [error, setError] = useState("");

  const handleGiveUp = async () => {
    const confirmed = window.confirm(
      "Give up this war? This will count as a defeat and end the campaign."
    );

    if (!confirmed) {
      return;
    }

    setIsGivingUp(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/war/campaigns/${campaign.id}/forfeit`,
        { method: "POST" }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not give up the war.");
      }

      onGiveUp(data.campaign);
    } catch (requestError) {
      setError(requestError.message || "Could not give up the war.");
      setIsGivingUp(false);
    }
  };

  return (
    <div className="give-up-control">
      {error ? <span className="give-up-error" role="alert">{error}</span> : null}
      <button
        type="button"
        className="give-up-button"
        onClick={handleGiveUp}
        disabled={isGivingUp}
      >
        {isGivingUp ? "Ending War..." : "Give Up"}
      </button>
    </div>
  );
}

export default GiveUp;