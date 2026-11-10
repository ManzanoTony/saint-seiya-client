import { useState } from "react";

function LosingScreen({ onHome }) {
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
      <section className="form-card war-end-card war-end-defeat">
        <p className="war-end-symbol" aria-hidden="true">💔</p>
        <h1>The Sanctuary Has Fallen</h1>
        <p>
          Hades' forces overwhelmed the Sanctuary. Return home to restore your
          Saints and prepare for a new campaign.
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

export default LosingScreen;