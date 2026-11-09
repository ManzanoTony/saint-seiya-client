import React, { useState, useEffect } from 'react';
import { fetchSanctuaryAlert } from './assets/gemini';
import './App.css';

function App() {
  const [saints, setSaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertData, setAlertData] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [selectedSaint, setSelectedSaint] = useState(null);
  const [battleResult, setBattleResult] = useState(null);

  // Fetch Saints and expand Rank relation from json-server on port 5005
  useEffect(() => {
    fetch('http://localhost:5005/saints?_expand=rank')
      .then((res) => res.json())
      .then((data) => {
        setSaints(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load saints from backend:', err);
        setLoading(false);
      });
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setBattleResult(null);
    setSelectedSaint(null);
    const threat = await fetchSanctuaryAlert();
    setAlertData(threat);
    setScanning(false);
  };

  const handleDispatch = (saint) => {
    setSelectedSaint(saint);
    if (!alertData) return;

    if (saint.cosmosPower >= alertData.requiredCosmos) {
      setBattleResult({
        success: true,
        message: `Victory! ${saint.name} successfully repelled ${alertData.enemy}!`
      });
    } else {
      setBattleResult({
        success: false,
        message: `Defeat! ${saint.name}'s cosmos (${saint.cosmosPower}) was too weak against ${alertData.enemy} (${alertData.requiredCosmos})!`
      });
    }
  };

  if (loading) return <div className="text-white text-center p-10">Loading Sanctuary Roster...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-amber-400 tracking-wider">ATHENA'S COMMAND CENTER</h1>
        <p className="text-slate-400 mt-2">Holy War Tactical Defense & Roster Management</p>
      </header>

      {/* Gemini Alert Scanner */}
      <section className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-8 shadow-xl max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-amber-500">🛡️ Sanctuary Perimeter Radar</h2>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded transition-colors disabled:opacity-50 cursor-pointer"
          >
            {scanning ? 'Scanning...' : '📡 Scan Perimeter'}
          </button>
        </div>

        {alertData ? (
          <div className="bg-red-950/40 border border-red-800/60 p-4 rounded-md">
            <span className="text-xs uppercase tracking-widest text-red-400 font-bold">Threat Detected</span>
            <h3 className="text-lg font-bold text-red-200 mt-1">{alertData.enemy}</h3>
            <p className="text-sm text-slate-300 mt-1">📍 <strong>Location:</strong> {alertData.location}</p>
            <p className="text-sm text-slate-300 mt-1">📜 {alertData.description}</p>
            <p className="text-sm text-amber-300 mt-2 font-semibold">⚡ Required Cosmos Power: {alertData.requiredCosmos}</p>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No active threats detected. Run a scan to monitor Sanctuary borders.</p>
        )}

        {battleResult && (
          <div className={`mt-4 p-4 rounded-md font-bold ${battleResult.success ? 'bg-green-900/50 text-green-200 border border-green-700' : 'bg-red-900/50 text-red-200 border border-red-700'}`}>
            {battleResult.message}
          </div>
        )}
      </section>

      {/* Roster Display */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-amber-400 mb-4 text-center">Sanctuary Roster ({saints.length} Warriors)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px' }}>
          {saints.map((saint) => (
            <div 
              key={saint.id} 
              style={{ height: '340px' }}
              className={`bg-slate-900 border rounded-lg p-3 flex flex-col items-center justify-between transition-all overflow-hidden ${selectedSaint?.id === saint.id ? 'border-amber-400 ring-2 ring-amber-400' : 'border-slate-800'}`}
            >
              {/* Character Image with explicit CSS class */}
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-950 border border-amber-500/40 flex items-center justify-center shrink-0 mb-1">
                <img 
                  src={saint.image} 
                  alt={saint.name} 
                  className="saint-card-img"
                />
              </div>

              <div className="text-center w-full">
                <h3 className="font-bold text-sm text-amber-200 truncate w-full">{saint.name}</h3>
                <p className="text-xs text-slate-400 truncate">{saint.constellation}</p>
                <p className="text-xs text-amber-500 font-semibold my-0.5">
                  Rank: {saint.rank ? saint.rank.name : 'Unknown'}
                </p>
                <span className="text-xs bg-slate-800 text-amber-400 px-2 py-0.5 rounded inline-block">
                  Cosmos: {saint.cosmosPower}
                </span>
              </div>

              <div className="w-full mt-1">
                {alertData ? (
                  <button
                    onClick={() => handleDispatch(saint)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1.5 px-3 rounded transition-colors cursor-pointer"
                  >
                    ⚔️ Dispatch
                  </button>
                ) : (
                  <div className="h-7"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
