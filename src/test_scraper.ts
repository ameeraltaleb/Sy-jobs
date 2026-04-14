import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
  try {
    const res = await axios.get('https://weworkremotely.com/remote-jobs.rss');
    const $ = cheerio.load(res.data, { xmlMode: true });
    const jobs: any[] = [];
    $('item').each((i, el) => {
      if(i >= 5) return;
      jobs.push({
        title: $(el).find('title').text(),
        link: $(el).find('link').text(),
        company: $(el).find('a10\\:author a10\\:name').text() || 'Company'
      });
    });
    console.log("WeWorkRemotely:", jobs);
  } catch(e: any) { console.error("WWR error:", e.message); }

  try {
    const res = await axios.get('https://remoteok.com/api');
    console.log("RemoteOK:", res.data.slice(1, 4).map((j:any) => j.position));
  } catch(e: any) { console.error("RemoteOK error:", e.message); }
}
test();
