import { useEffect, useRef, useState } from "react";

const VIDEO_LOAD_TIMEOUT = 15000;

function WarEndVideo({ src, label }) {
  const [status, setStatus] = useState("loading");
  const videoRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = 0;
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      console.error(`${label} did not load within ${VIDEO_LOAD_TIMEOUT}ms.`);
      setStatus("error");
    }, VIDEO_LOAD_TIMEOUT);

    video.play().catch((playError) => {
      console.error(`Could not autoplay ${label}:`, playError);
    });

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [label]);

  const handleLoadedData = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setStatus("ready");
  };

  const handleError = (event) => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    console.error(`Could not load ${label}:`, event.currentTarget.error);
    setStatus("error");
  };

  return (
    <div
      className="war-end-video-frame"
      aria-busy={status === "loading"}
    >
      <video
        ref={videoRef}
        className="war-end-video"
        playsInline
        preload="auto"
        aria-label={label}
        onLoadedData={handleLoadedData}
        onError={handleError}
      >
        <source src={src} type="video/mp4" />
      </video>
      {status !== "ready" ? (
        <div
          className="war-end-video-feedback"
          role={status === "loading" ? "status" : "alert"}
          aria-live={status === "loading" ? "polite" : "assertive"}
        >
          {status === "loading" ? (
            <>
              <span className="loading-spinner" aria-hidden="true" />
              <span>Preparing the final scene...</span>
            </>
          ) : (
            <span>
              The scene could not be loaded. You can still return home.
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default WarEndVideo;
