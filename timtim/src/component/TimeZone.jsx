import React, { useState, useEffect } from 'react';
import { formatInTimeZone } from 'date-fns-tz';

const TimeZone= ({ timeZone }) => {
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const formattedTime = formatInTimeZone(now, timeZone, 'yyyy-MM-dd HH:mm:ss');
            setCurrentTime(formattedTime);
        };

        updateTime(); // Set initial time
        const intervalId = setInterval(updateTime, 1000); // Update every second

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [timeZone]);

    return (
        <div>
            <h2>Current Time in {timeZone}</h2>
            <p>{currentTime}</p>
        </div>
    );
};

export default TimeZone
