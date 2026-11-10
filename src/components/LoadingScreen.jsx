function LoadingScreen({ message, className = "" }) {
  return (
    <div
      className={`loading-screen ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <span className="loading-spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export default LoadingScreen;
