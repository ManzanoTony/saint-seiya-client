import { useState } from "react";

function WinningScreen({ onHome }) {
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState("");

  const handleHome = async () => {
    setIsResetting(true);
    setError("");

    try {
      await onHome();
    } catch (resetError) {
      setError(resetError.message || "Could not reset the Sanctuary. Please try again.");
      setIsResetting(false);
    }
  };

  return (
    <main className="command-container war-end-screen">
      <section className="form-card war-end-card war-end-victory">
        <h1>The Sanctuary Is Saved!</h1>
        <p>
          Your Saints defeated Hades' forces and protected Athena. Return home to
          start again with a fresh roster and new campaign.
        </p>
        {error ? <p className="war-error" role="alert">{error}</p> : null}
        <button
          type="button"
          className="btn-primary war-action-button"
          onClick={handleHome}
          disabled={isResetting}
        >
          {isResetting ? "Restoring the Sanctuary..." : "Return Home"}
        </button>
      </section>
    </main>
  );
}

export default WinningScreen;