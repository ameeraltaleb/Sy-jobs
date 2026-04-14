import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
  const channels = [
    'SyriaJobsNetwork',
    'khotwa_sy',
    'workinginsyria',
    'ngojobs_syria',
    'SyrianLaborMarket',
    'Tatwaa',
    'Damascus_Jobs',
    'RemoteWorkSy',
    'JobAds_Sy',
    'YourGateToWork'
  ];
  
  const results: any = {};

  for (const channel of channels) {
    try {
      console.log(`Testing channel: ${channel}`);
      const res = await axios.get(`https://t.me/s/${channel}`, {
        headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
      });
      const $ = cheerio.load(res.data);
      const messages: any[] = [];
      
      $('.tgme_widget_message').each((i, el) => {
        let htmlText = $(el).find('.tgme_widget_message_text').html() || '';
        htmlText = htmlText.replace(/<br\s*[\/]?>/gi, '\n');
        const cleanText = cheerio.load(htmlText).text().trim();
        
        if (cleanText && cleanText.length > 50) {
          messages.push(cleanText);
        }
      });
      
      results[channel] = messages.length;
      console.log(`Found ${messages.length} messages in ${channel}`);
    } catch(e: any) { 
      results[channel] = 'Error: ' + e.message;
      console.error(`Error in ${channel}:`, e.message); 
    }
  }
  console.log("FINAL RESULTS:", results);
}
test();
