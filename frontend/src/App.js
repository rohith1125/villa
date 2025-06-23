import { useEffect, useState } from 'react';
import './App.css';

function VillaList() {
  const [villas, setVillas] = useState([]);

  useEffect(() => {
    fetch('/villa')
      .then((res) => res.json())
      .then((data) => setVillas(data))
      .catch(() => setVillas([]));
  }, []);

  return (
    <div>
      <h2>Available Villas</h2>
      <ul>
        {villas.map((v) => (
          <li key={v.id}>
            {v.title} - {v.location} (${`$${v.pricePerNight}`})
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Villa Rental</h1>
      </header>
      <main className="App-main">
        <VillaList />
      </main>
    </div>
  );
}

export default App;
