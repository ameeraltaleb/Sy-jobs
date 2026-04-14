const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  try {
    const res = await axios.get('https://sy.laimoon.com/jobs', {
      headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    });
    const $ = cheerio.load(res.data);
    const jobs = [];
    $('.job-title a').each((i, el) => {
      jobs.push({title: $(el).text().trim(), link: $(el).attr('href')});
    });
    console.log("Laimoon:", jobs);
  } catch(e) { console.error("Laimoon error:", e.message); }

  try {
    const res2 = await axios.get('https://www.for9a.com/opportunities', {
      headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    });
    const $2 = cheerio.load(res2.data);
    const jobs2 = [];
    $2('a').each((i, el) => {
      const href = $2(el).attr('href');
      if(href && href.includes('/opportunity/')) {
        jobs2.push({title: $2(el).text().trim(), link: href});
      }
    });
    console.log("For9a:", jobs2.slice(0, 5));
  } catch(e) { console.error("For9a error:", e.message); }
}
test();
