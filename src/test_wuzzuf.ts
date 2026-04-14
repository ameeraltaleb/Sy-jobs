import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
  try {
    const res = await axios.get('https://wuzzuf.net/search/jobs/?q=Syria', {
      headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    });
    const $ = cheerio.load(res.data);
    const jobs: any[] = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if(href && href.includes('/jobs/p/')) {
        jobs.push({title: $(el).text().trim(), link: href});
      }
    });
    console.log("Wuzzuf:", jobs.slice(0, 5));
  } catch(e: any) { console.error("Wuzzuf error:", e.message); }
}
test();
