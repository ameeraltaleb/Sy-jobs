import axios from 'axios';
import * as cheerio from 'cheerio';

async function testNSJobs() {
  try {
    console.log('Fetching api.nsjobs.net/api/jobs/details...');
    const response = await axios.get('https://api.nsjobs.net/api/jobs/details/f8DWIslGIV1776068364', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    console.log(Object.keys(response.data));
    console.log(Object.keys(response.data.data));
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testNSJobs();