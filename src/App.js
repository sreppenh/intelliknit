import React, { useEffect } from 'react';
import './App.css';
import IntelliknitMVP from './features/projects/components/IntelliknitMVP';

function App() {
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.target.type === 'number') {
        e.target.blur();
      }
    };

    const handleFocus = (e) => {
      if (e.target.type === 'number') {
        e.target.select();
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('focus', handleFocus, true);

    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('focus', handleFocus, true);
    };
  }, []);

  return (
    <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <IntelliknitMVP />
    </div>
  );
}

export default App;