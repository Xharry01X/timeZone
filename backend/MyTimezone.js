import axios from 'axios';
import { NTPClient } from 'ntpclient';

// Constants
const DIRECTION = {
  EAST: 'E',
  WEST: 'W'
};

const defaultConfig = {
  ntpServer: 'pool.ntp.org',
  offline: false
};

const nominatimAPI = 'https://nominatim.openstreetmap.org';

class MyTimezone {
  constructor(config = {}) {
    this.config = {
      ...defaultConfig,
      ...config
    };
    this.ntpClient = new NTPClient(this.config.ntpServer);
  }

  async getLocation(location) {
    try {
      const coordinates = this.parseCoordinates(location);
      return coordinates;
    } catch (error) {
      if (error.message.includes('No coordinates parsed')) {
        return this.getLocationByName(location);
      }
      throw error;
    }
  }

  async getLocationByName(address, radius) {
    const requestConfig = {
      method: 'get',
      params: {
        format: 'json',
        limit: 9,
        q: address
      },
      url: `${nominatimAPI}/search`
    };

    if (radius) {
      requestConfig.params.radius = radius;
    }

    let results;

    try {
      const response = await axios.request(requestConfig);
      results = response.data;
    } catch (error) {
      throw new Error(`Nominatim API Error: ${error.message}`);
    }

    if (!results.length) {
      throw new Error('No place found.');
    }

    const { display_name, lon } = results[0];
    const parsedLongitude = parseFloat(lon);

    return {
      formattedAddress: display_name,
      longitude: parsedLongitude
    };
  }

  async getDateByAddress(address) {
    const { longitude } = await this.getLocationByName(address);
    return this.getDateByLongitude(longitude);
  }

  async getDateByLongitude(longitude) {
    const direction = longitude < 0 ? DIRECTION.WEST : DIRECTION.EAST;
    const utcDate = await this.getUTCDate();
    const offsetMillis = this.getOffsetMillis(longitude, direction);

    const calculatedDate =
      direction === DIRECTION.EAST
        ? new Date(utcDate.getTime() + offsetMillis)
        : new Date(utcDate.getTime() - offsetMillis);
    return calculatedDate;
  }

  parseCoordinates(coordinates) {
    const longitudeRegex = new RegExp('[-?\\W\\d\\.]+,(?<longitude>[-?\\W\\d\\.]+)');
    const parsedRegex = longitudeRegex.exec(coordinates);
    if (parsedRegex?.groups?.longitude) {
      try {
        const longitude = parseFloat(parsedRegex.groups.longitude);
        return { longitude };
      } catch (_error) {
        throw new Error(`Invalid coordinates: "${coordinates}"`);
      }
    }
    throw new Error(`No coordinates parsed: "${coordinates}"`);
  }

  parseDate(date) {
    const isoString = date.toISOString();
    const dateRegex =
      /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hours>\d{2}):(?<minutes>\d{2}):(?<seconds>\d{2})/g;
    const parsedString = dateRegex.exec(isoString);
    if (!parsedString?.groups) {
      throw new Error('Could not parse date');
    }
    const { year, month, day, hours, minutes, seconds } = parsedString.groups;
    return { day, hours, minutes, month, seconds, year };
  }

  getOffsetMillis(longitudeDegrees, direction) {
    const oneHourInMillis = 3_600_000;
    const dayInHours = 24;
    const degreesOnEarth = 360;
    const dir = direction === DIRECTION.EAST ? 1 : -1;
    const offsetHours = (dir * longitudeDegrees * dayInHours) / degreesOnEarth;
    return offsetHours * oneHourInMillis;
  }

  async getUTCDate() {
    return this.config.offline ? new Date() : this.ntpClient.getNetworkTime();
  }
}

export { MyTimezone, DIRECTION };