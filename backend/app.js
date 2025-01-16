import { NTPClient } from './NTPserver.js';

async function getTimeDifference() {
    try {
        const client = new NTPClient('time.google.com');
        const ntpTime = await client.getNetworkTime();

        // Convert Date to local time string
        const systemTime = new Date();
        const systemTimeLocal = systemTime.toLocaleString();
        const ntpTimeLocal = new Date(ntpTime).toLocaleString();

        // Calculate time difference
        const timeDiff = Math.abs(systemTime - ntpTime);

        console.log(`Current System Time: ${systemTimeLocal}`);
        console.log(`Current NTP Time: ${ntpTimeLocal}`);
        console.log(`Time Difference: ${timeDiff} milliseconds`);
    } catch (error) {
        console.error('Error occurred:', error.message);
    }
}

// Run the function every 5 seconds
setInterval(getTimeDifference, 5000);

// Initial call to start immediately
getTimeDifference();