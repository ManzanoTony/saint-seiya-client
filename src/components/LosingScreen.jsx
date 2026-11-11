import { useEffect, useRef, useState } from "react";

function LosingScreen({ onHome }) {
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch((playError) => {
      console.error("Could not autoplay Athena-Dies:", playError);
    });
  }, []);

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
        <video
          ref={videoRef}
          className="war-end-video"
          autoPlay
          playsInline
          preload="auto"
          aria-label="Athena's final scene"
        >
          <source src="/Athena-Dies.mp4" type="video/mp4" />
        </video>
        <h1>The Sanctuary Has Fallen</h1>
        <p>
          Hades' Greatest Eclipse is complete... Eternal darkness has consumed
          the world, and Athena has fallen! Return home to start a new Holy War!
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

export default LosingScreen;