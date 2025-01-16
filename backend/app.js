import { MyTimezone } from "./MyTimezone.js";

const timezone = new MyTimezone();

async function test() {
  try {
    const location = await timezone.getLocation('Varanasi, India');
    const date = await timezone.getDateByAddress('Varanasi, India');
    
    console.log('Location:', location);
    console.log('Date:', date);
    console.log('Parsed Date:', timezone.parseDate(date));
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

test();