import React, { useEffect } from 'react';
import './App.css';
import IntelliknitMVP from './features/projects/components/IntelliknitMVP';
import useWakeLock from './shared/hooks/useWakeLock';
import WakeLockBanner from './shared/components/WakeLockBanner';

function App() {
  // ✨ Keep screen awake while app is open
  const { needsActivation, activate, isActive } = useWakeLock();

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

      {/* One-time wake lock activation banner */}
      <WakeLockBanner
        needsActivation={needsActivation}
        onActivate={activate}
        isActive={isActive}
      />
    </div>
  );
}

export default App;