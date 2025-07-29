import React from 'react';
import './App.css';
import IntelliknitMVP from './features/projects/components/IntelliknitMVP';

function App() {
  return (
    <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <IntelliknitMVP />
    </div>
  );
}

export default App;