import React, { useEffect } from 'react';
import './App.css';
import IntelliknitMVP from './features/projects/components/IntelliknitMVP';
import useWakeLock from './shared/hooks/useWakeLock';
import WakeLockDebug from './shared/components/WakeLockDebug';

function App() {
  // ✨ NEW: Keep screen awake while app is open
  // 🐛 DEBUG MODE: Shows visual status indicator
  const wakeLockStatus = useWakeLock({ debug: true });

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
      {/* 🐛 DEBUG: Remove this component after troubleshooting */}
      <WakeLockDebug status={wakeLockStatus} />
    </div>
  );
}

export default App;