import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';


const API_URL = `${import.meta.env.VITE_API_URL}/saints`;

function App() {
  const [saints, setSaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API_URL)
      .then((response) => {
        setSaints(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching Sanctuary roster:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <h2>Communicating with Sanctuary...</h2>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Athena's Holy War Command Center</h1>
      <h2>Sanctuary Roster</h2>
      
      <div>
        {saints.map((saint) => (
          <div key={saint.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px', borderRadius: '8px' }}>
            <h3>{saint.name}</h3>
            <p><strong>Constellation:</strong> {saint.constellation}</p>
            <p><strong>Rank:</strong> {saint.rank}</p>
            <p><strong>Cosmos Power:</strong> {saint.cosmosPower}</p>
            <p><strong>Status:</strong> {saint.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
