function LandingScreen({ onStart, onSurrender }) {
  return (
    <main className="landing-screen">
      <section className="landing-card">
        <div className="landing-hero">
          <div className="landing-portrait-frame">
            <img src="/Seiya.png" alt="Seiya" className="landing-portrait" />
          </div>
          <div className="landing-portrait-frame">
            <img src="/Athena.png" alt="Athena" className="landing-portrait" />
          </div>
        </div>

        <div className="landing-content">
          <div className="landing-hero-copy">
            <h1 className="landing-title">
              <span>Saint Seiya: The Hades</span>
              <span>Chapter – Sanctuary</span>
            </h1>
          </div>
          <div className="landing-copy">
            <p>
              Hear me... You are my sacred Saint, and humanity is in mortal
              danger as Hades, the god of the underworld, unleashes his Greatest
              Eclipse to plunge the world into eternal darkness and extinguish
              all light! We must defeat him and his armies to protect humanity!
              Rise, my noble Saint, and do not fail me—the fate of humanity
              rests in your hands!
            </p>
          </div>
        </div>

        <div className="landing-actions">
          <button type="button" onClick={onStart} className="btn btn-primary">
            Save the world
          </button>
          <button
            type="button"
            onClick={onSurrender}
            className="btn btn-danger"
          >
            Let the world die
          </button>
        </div>
      </section>
    </main>
  );
}

export default LandingScreen;
