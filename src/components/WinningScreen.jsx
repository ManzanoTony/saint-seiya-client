import { useState } from "react";
import WarEndVideo from "./WarEndVideo";

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
    <main className="command-container war-end-screen war-end-screen-victory">
      <section className="form-card war-end-card war-end-victory">
        <WarEndVideo
          src="/Blue-For-Ever.mp4"
          label="Saint Seiya victory scene"
        />
        <h1>You defeated Hades! Athena and the world have been saved!</h1>
        <p>
          Your Saints defeated Hades' forces and protected Athena and the
          World. Return home to start again with a fresh Saint roster and a new
          Holy War.
        </p>
        {error ? <p className="war-error" role="alert">{error}</p> : null}
        <button
          type="button"
          className="btn btn-primary war-action-button"
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