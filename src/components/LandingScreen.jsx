function LandingScreen({ onStart, onSurrender }) {
  return (
    <div className="landing-container">
      {/* 1. Saint Seiya Iconic Image Header */}
      <div className="landing-header-card">
        <img
          src="/Seiya.png"
          alt="Saint Seiya Iconic"
          className="landing-image"
        />
        <h2>Athena's Command Center</h2>
      </div>

      {/* 2. App Explanation Container */}
      <div className="landing-explanation-card">
        <h3>The Holy War Begins</h3>
        <p>
          Welcome, Commander. Evil forces are rising, and the Sanctuary needs your tactical guidance. 
          Manage your roster of Saints, inspect combat readiness, track war statistics, and deploy warriors to defend Athena.
        </p>
        <p>
          Choose your path below: steps will determine the fate of the Sanctuary.
        </p>
      </div>

      {/* 3. Action Buttons */}
      <div className="landing-button-group">
        <button onClick={onStart} className="btn-fight">
          Save the world
        </button>
        <button
          onClick={onSurrender}
          className="btn-surrender"
        >
          Let the world die
        </button>
      </div>
    </div>
  );
}

export default LandingScreen;
