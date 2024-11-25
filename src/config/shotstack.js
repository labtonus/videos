import Shotstack from 'shotstack-sdk';
import dotenv from 'dotenv';

dotenv.config();

const shotstack = new Shotstack({
  apiKey: process.env.SHOTSTACK_API_KEY,
  host: process.env.SHOTSTACK_HOST
});

export default shotstack;