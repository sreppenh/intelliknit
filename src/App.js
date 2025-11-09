import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import IntelliknitMVP from './features/projects/components/IntelliknitMVP';
import WakeLockBanner from './shared/components/WakeLockBanner';

function App() {
  // Store wake lock reference
  const wakeLockRef = useRef(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if we should show the banner (first time or not dismissed)
    const wakeLockStatus = localStorage.getItem('intelliknit_wakelock_activated');
    if (!wakeLockStatus) {
      // Show banner after a brief delay for smoother UX
      setTimeout(() => setShowBanner(true), 500);
    }

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

    // Re-acquire wake lock when page becomes visible (if user previously activated it)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && wakeLockRef.current === null) {
        const wakeLockStatus = localStorage.getItem('intelliknit_wakelock_activated');

        // Only try to re-acquire if user has activated it before and it was successful
        if (wakeLockStatus === 'true' && 'wakeLock' in navigator) {
          navigator.wakeLock.request('screen')
            .then(wakeLock => {
              console.log('✅ Wake lock re-acquired on page visibility');
              wakeLockRef.current = wakeLock;
              wakeLock.addEventListener('release', () => {
                console.log('Wake lock released');
                wakeLockRef.current = null;
              });
            })
            .catch(err => {
              console.log('Failed to re-acquire wake lock:', err.name);
            });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Release wake lock on unmount
      if (wakeLockRef.current !== null) {
        wakeLockRef.current.release().catch(console.error);
      }
    };
  }, []);

  const handleWakeLockSuccess = () => {
    console.log('🎉 Wake lock successfully activated');
  };

  return (
    <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <IntelliknitMVP />

      {/* One-time wake lock activation banner */}
      {showBanner && (
        <WakeLockBanner
          wakeLockRef={wakeLockRef}
          onSuccess={handleWakeLockSuccess}
        />
      )}
    </div>
  );
}

export default App;