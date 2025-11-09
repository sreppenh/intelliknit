import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import IntelliknitMVP from './features/projects/components/IntelliknitMVP';
import WakeLockBanner from './shared/components/WakeLockBanner';

function App() {
  // Store wake lock reference
  const wakeLockRef = useRef(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const wakeLockStatus = localStorage.getItem('intelliknit_wakelock_activated');

    /**
     * Attempt to acquire wake lock
     */
    const attemptWakeLock = async () => {
      if (!('wakeLock' in navigator)) {
        return false;
      }

      if (wakeLockRef.current !== null) {
        return true; // Already active
      }

      try {
        const wakeLock = await navigator.wakeLock.request('screen');
        console.log('✅ Wake lock activated');
        wakeLockRef.current = wakeLock;
        wakeLock.addEventListener('release', () => {
          console.log('Wake lock released');
          wakeLockRef.current = null;
        });
        return true;
      } catch (err) {
        console.log(`Wake lock failed: ${err.name}`);
        return false;
      }
    };

    /**
     * Activate wake lock on ANY user interaction
     */
    const activateOnInteraction = () => {
      attemptWakeLock().then(success => {
        if (success) {
          // Remember that user has used the app (counts as implicit consent)
          localStorage.setItem('intelliknit_wakelock_activated', 'true');
          // Remove listeners after first successful activation
          document.removeEventListener('click', activateOnInteraction);
          document.removeEventListener('touchstart', activateOnInteraction);
          document.removeEventListener('scroll', activateOnInteraction);
        }
      });
    };

    if (!wakeLockStatus) {
      // First time user - show banner to explain what will happen
      setTimeout(() => setShowBanner(true), 500);
    } else if (wakeLockStatus === 'true') {
      // Returning user - activate on first interaction
      document.addEventListener('click', activateOnInteraction, { once: true });
      document.addEventListener('touchstart', activateOnInteraction, { once: true });
      document.addEventListener('scroll', activateOnInteraction, { once: true });
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

    // Re-acquire wake lock when switching back to app
    const handleVisibilityChange = async () => {
      const wakeLockStatus = localStorage.getItem('intelliknit_wakelock_activated');

      if (document.visibilityState === 'visible' && wakeLockStatus === 'true') {
        if (wakeLockRef.current === null && 'wakeLock' in navigator) {
          try {
            const wakeLock = await navigator.wakeLock.request('screen');
            console.log('✅ Wake lock re-acquired on app switch');
            wakeLockRef.current = wakeLock;
            wakeLock.addEventListener('release', () => {
              wakeLockRef.current = null;
            });
          } catch (err) {
            console.log('Failed to re-acquire:', err.name);
          }
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

      {/* Wake lock activation banner - shows when needed */}
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