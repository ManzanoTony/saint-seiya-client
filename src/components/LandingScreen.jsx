function LandingScreen({ onStart, onSurrender }) {
  return (
    <main className="landing-screen">
      <section className="landing-card">
        <div className="landing-hero">
          <img
            src="/Seiya.png"
            alt="Saint Seiya Iconic"
            className="landing-portrait"
          />
          <div>
            <p className="landing-eyebrow">The Sanctuary awaits</p>
            <h1 className="landing-title">Athena&apos;s Command Center</h1>
          </div>
        </div>

        <div className="landing-copy">
          <h2>The Holy War Begins</h2>
          <p>
            Welcome, Commander. Evil forces are rising, and the Sanctuary needs
            your tactical guidance. Manage your roster of Saints, inspect combat
            readiness, track war statistics, and deploy warriors to defend Athena.
          </p>
          <p className="landing-hint">
            Choose your path. The fate of the Sanctuary rests in your hands.
          </p>
        </div>

        <div className="landing-actions">
          <button type="button" onClick={onStart} className="btn btn-warning">
            Save the world
          </button>
          <button
            type="button"
            onClick={onSurrender}
            className="btn btn-surrender"
          >
            Let the world die
          </button>
        </div>
      </section>
    </main>
  );
}

export default LandingScreen;
