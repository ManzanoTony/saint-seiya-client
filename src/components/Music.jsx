import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useLocation } from "react-router-dom";

const MUSIC_VOLUME = 0.7;

function getControlFrame(pathname) {
  const frameSelector =
    pathname === "/"
      ? ".landing-card"
      : pathname === "/command"
        ? ".roster-screen"
        : pathname === "/war"
          ? ".war-screen"
          : pathname === "/war/victory" || pathname === "/war/defeat"
            ? ".war-end-card"
            : /^\/saint\/[^/]+$/.test(pathname)
              ? ".saint-detail-screen, .command-container"
              : ".app-container";

  return document.querySelector(frameSelector);
}

function subscribeToControlFrameChanges(onChange) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

function Music() {
  const { pathname } = useLocation();
  const [volume, setVolume] = useState(MUSIC_VOLUME);
  const [isMuted, setIsMuted] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const controlFrame = useSyncExternalStore(
    subscribeToControlFrameChanges,
    () => getControlFrame(pathname),
    () => null,
  );
  const source =
    pathname === "/"
      ? "/Chikyuugi.mp3"
      : pathname === "/command" || /^\/saint\/[^/]+$/.test(pathname)
        ? "/Artemis.mp3"
        : pathname === "/war"
          ? "/The-Realm-of-Athena.mp3"
          : null;
  const audioRef = useRef(null);
  const controlDockRef = useRef(null);
  const currentSourceRef = useRef(null);
  const desiredSourceRef = useRef(source);
  const targetVolumeRef = useRef(MUSIC_VOLUME);
  const transitionIdRef = useRef(0);
  const transitionRef = useRef(null);
  const effectiveVolume = isMuted ? 0 : volume;
  const isAudioMuted = isMuted || volume === 0;

  useEffect(() => {
    targetVolumeRef.current = effectiveVolume;
    if (audioRef.current) {
      audioRef.current.volume = effectiveVolume;
      audioRef.current.muted = effectiveVolume === 0;
    }
  }, [effectiveVolume]);

  useEffect(() => {
    const synchronizeVideo = (video) => {
      video.volume = effectiveVolume;
      video.muted = effectiveVolume === 0;
    };
    const synchronizeNode = (node) => {
      if (!(node instanceof Element)) return;
      if (node instanceof HTMLVideoElement) {
        synchronizeVideo(node);
      }
      node.querySelectorAll("video").forEach(synchronizeVideo);
    };
    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach(synchronizeNode);
      });
    });
    const synchronizeChangedVideo = (event) => {
      if (event.target instanceof HTMLVideoElement) {
        synchronizeVideo(event.target);
      }
    };

    document.querySelectorAll("video").forEach(synchronizeVideo);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener(
      "volumechange",
      synchronizeChangedVideo,
      true,
    );

    return () => {
      observer.disconnect();
      document.removeEventListener(
        "volumechange",
        synchronizeChangedVideo,
        true,
      );
    };
  }, [effectiveVolume]);

  const transitionTo = useCallback((nextSource) => {
    desiredSourceRef.current = nextSource;
    const transitionId = ++transitionIdRef.current;
    const player = audioRef.current;
    if (!player) return;

    if (!nextSource) {
      currentSourceRef.current = null;
      player.pause();
      player.currentTime = 0;
      player.removeAttribute("src");
      player.load();
      return;
    }

    if (currentSourceRef.current !== nextSource) {
      player.pause();
      player.currentTime = 0;
      player.src = nextSource;
      player.loop = true;
      player.load();
      currentSourceRef.current = nextSource;
    } else if (!player.paused) {
      return;
    }

    player.volume = targetVolumeRef.current;
    player.muted = targetVolumeRef.current === 0;
    player.play().catch((playError) => {
      if (
        transitionId === transitionIdRef.current &&
        playError.name !== "NotAllowedError"
      ) {
        console.error("Could not play route music:", playError);
      }
    });
  }, []);

  useEffect(() => {
    transitionRef.current = transitionTo;
    transitionTo(source);
  }, [source, transitionTo]);

  useEffect(() => {
    const resumeMusic = () => {
      const desiredSource = desiredSourceRef.current;
      const player = audioRef.current;

      if (
        !desiredSource ||
        (currentSourceRef.current === desiredSource &&
          player &&
          !player.paused)
      ) {
        return;
      }

      transitionRef.current?.(desiredSource);
    };

    document.addEventListener("pointerdown", resumeMusic, true);
    document.addEventListener("keydown", resumeMusic, true);
    return () => {
      document.removeEventListener("pointerdown", resumeMusic, true);
      document.removeEventListener("keydown", resumeMusic, true);
    };
  }, []);

  useEffect(() => {
    const closeControlsOnOutsidePress = (event) => {
      if (!controlDockRef.current?.contains(event.target)) {
        setIsControlsOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeControlsOnOutsidePress);
    return () => {
      document.removeEventListener("pointerdown", closeControlsOnOutsidePress);
    };
  }, []);

  useEffect(() => () => {
    transitionIdRef.current += 1;
    audioRef.current?.pause();
    audioRef.current?.removeAttribute("src");
    currentSourceRef.current = null;
  }, []);

  const toggleMute = () => {
    if (isAudioMuted) {
      if (volume === 0) {
        setVolume(MUSIC_VOLUME);
      }
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (event) => {
    const nextVolume = Number(event.currentTarget.value);
    setVolume(nextVolume);
    if (nextVolume > 0) {
      setIsMuted(false);
    }
  };

  const controlDock = (
    <div ref={controlDockRef} className="music-control-dock">
      {isControlsOpen ? (
        <div
          id="music-control-panel"
          className="music-control-panel"
          role="group"
          aria-label="Audio controls"
        >
          <div className="music-control-panel-heading">
            <label htmlFor="audio-volume">Audio volume</label>
            <output className="music-volume-value" htmlFor="audio-volume">
              {Math.round(effectiveVolume * 100)}%
            </output>
          </div>
          <input
            id="audio-volume"
            className="music-volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            aria-label="Audio volume"
          />
          <button
            type="button"
            className="btn btn-ghost music-mute-button"
            onClick={toggleMute}
            aria-label={isAudioMuted ? "Unmute audio" : "Mute audio"}
            aria-pressed={isAudioMuted}
          >
            {isAudioMuted ? "Unmute" : "Mute"}
          </button>
        </div>
      ) : null}
      <button
        type="button"
        className="music-control-toggle"
        onClick={() => setIsControlsOpen((isOpen) => !isOpen)}
        aria-label={isControlsOpen ? "Close audio controls" : "Open audio controls"}
        aria-expanded={isControlsOpen}
        aria-controls="music-control-panel"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 10v4h4l5 4V6l-5 4H4z" />
          {isAudioMuted ? (
            <path d="m17 9 5 6m0-6-5 6" />
          ) : (
            <>
              <path d="M16 9a5 5 0 0 1 0 6" />
              <path d="M18.5 6.5a9 9 0 0 1 0 11" />
            </>
          )}
        </svg>
      </button>
    </div>
  );

  return (
    <>
      {controlFrame ? createPortal(controlDock, controlFrame) : null}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        style={{ display: "none" }}
      />
    </>
  );
}

export default Music;