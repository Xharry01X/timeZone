import React, { useState, useEffect } from 'react';

function App() {
  const [isRushHour, setIsRushHour] = useState(false);

  useEffect(() => {
    const checkTime = async () => {
      try {
        // Fetch current time from server
        const response = await fetch('http://localhost:3000/');
        const data = await response.json();
        
        // Convert server time to local time
        const serverTime = new Date(data.time);
        const localTime = new Date(serverTime.toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }));

        // Check if it's rush hour (12 PM to 5 PM)
        const now = localTime.getHours();
        if (now >= 12 && now < 17) { // 12 for 12 PM, 17 for 5 PM
          setIsRushHour(true);
        } else {
          setIsRushHour(false);
        }
      } catch (error) {
        console.error('Error fetching time:', error);
      }
    };

    // Check every minute
    const interval = setInterval(checkTime, 60000);
    // Initial check
    checkTime();

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h1>{isRushHour ? "It's Rush Hour!" : "Not Rush Hour"}</h1>
    </div>
  );
}

export default App;