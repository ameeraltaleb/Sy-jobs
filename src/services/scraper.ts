import { db } from '../../firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY2;
const isPlaceholder = apiKey === 'MY_GEMINI_API_KEY';

if (!apiKey || isPlaceholder) {
  console.warn('Warning: GEMINI_API_KEY2 is not set or is a placeholder. AI features will be disabled.');
}
const ai = new GoogleGenAI({ apiKey: (apiKey && !isPlaceholder) ? apiKey : 'dummy-key' });

function generateSlug(title: string, company: string): string {
  const base = `${title}-${company}`
    .replace(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${base}-${Math.floor(Math.random() * 1000)}`;
}

async function scrapeUNJobs() {
  console.log('Scraping UNJobs for Syria...');
  const jobs: any[] = [];
  try {
    const response = await axios.get('https://unjobs.org/duty_stations/syria', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    $('.job').each((i, el) => {
      if (jobs.length >= 100) return; // Limit to 100 to avoid excessive quota usage
      const title = $(el).find('a.jtitle').text().trim();
      const link = $(el).find('a.jtitle').attr('href');
      const companyNode = $(el).find('br').first()[0]?.nextSibling;
      const company = companyNode && 'data' in companyNode ? (companyNode as any).data.trim() : 'UN/NGO';
      
      if (title && link) {
        jobs.push({
          title,
          sourceUrl: link.startsWith('http') ? link : `https://unjobs.org${link}`,
          company: company.replace(/Updated:.*$/, '').trim(),
          location: 'سوريا'
        });
      }
    });
  } catch (error) {
    console.error('Error scraping UNJobs:', error);
  }
  return jobs;
}

async function scrapeTanqeeb() {
  console.log('Scraping Tanqeeb for Syria...');
  const jobs: any[] = [];
  try {
    const response = await axios.get('https://syria.tanqeeb.com/ar/jobs/search', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Find job links in Tanqeeb
    $('a[href*="/job/"]').each((i, el) => {
      if (jobs.length >= 100) return; // Limit to 100
      
      const link = $(el).attr('href');
      const title = $(el).text().replace(/\s+/g, ' ').trim();
      
      // Filter out generic links and empty titles
      if (title && link && title.length > 5 && !title.includes('وظائف') && !title.includes('بحث')) {
        jobs.push({
          title,
          sourceUrl: link.startsWith('http') ? link : `https://syria.tanqeeb.com${link}`,
          company: 'شركة خاصة', // Fallback, Gemini will try to extract real company from title/description
          location: 'سوريا'
        });
      }
    });
  } catch (error) {
    console.error('Error scraping Tanqeeb:', error);
  }
  return jobs;
}

async function scrapeRemoteTanqeeb() {
  console.log('Scraping Tanqeeb for Remote Jobs...');
  const jobs: any[] = [];
  try {
    // Search for "عن بعد" (Remote) across the Arab world
    const response = await axios.get('https://www.tanqeeb.com/ar/jobs/search?keywords=%D8%B9%D9%86+%D8%A8%D8%B9%D8%AF', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    $('a[href*="/job/"]').each((i, el) => {
      if (jobs.length >= 100) return; // Limit to 100
      
      const link = $(el).attr('href');
      const title = $(el).text().replace(/\s+/g, ' ').trim();
      
      if (title && link && title.length > 5 && !title.includes('وظائف') && !title.includes('بحث')) {
        jobs.push({
          title,
          sourceUrl: link.startsWith('http') ? link : `https://www.tanqeeb.com${link}`,
          company: 'شركة خاصة',
          location: 'عن بعد'
        });
      }
    });
  } catch (error) {
    console.error('Error scraping Remote Tanqeeb:', error);
  }
  return jobs;
}

async function scrapeRemotive() {
  console.log('Scraping Remotive for Worldwide Remote Jobs...');
  const jobs: any[] = [];
  try {
    const response = await axios.get('https://remotive.com/api/remote-jobs?limit=50');
    if (response.data && response.data.jobs) {
      const worldwideJobs = response.data.jobs.filter((job: any) => {
        const loc = (job.candidate_required_location || '').toLowerCase();
        return loc.includes('worldwide') || loc.includes('anywhere') || loc.includes('global');
      }).slice(0, 50); // Limit to 50
      
      worldwideJobs.forEach((item: any) => {
        if (item.title && item.url) {
          jobs.push({
            title: item.title,
            sourceUrl: item.url,
            company: item.company_name || 'شركة عالمية',
            location: 'عن بعد',
            description: item.description
          });
        }
      });
    }
  } catch (error) {
    console.error('Error scraping Remotive:', error);
  }
  return jobs;
}

async function scrapeWeWorkRemotely() {
  console.log('Scraping WeWorkRemotely for Remote Jobs...');
  const jobs: any[] = [];
  try {
    const response = await axios.get('https://weworkremotely.com/remote-jobs.rss');
    const $ = cheerio.load(response.data, { xmlMode: true });
    $('item').each((i, el) => {
      if (jobs.length >= 50) return; // Limit to 50
      const title = $(el).find('title').text();
      const link = $(el).find('link').text();
      const company = title.split(':')[0] || 'شركة عالمية';
      const cleanTitle = title.includes(':') ? title.split(':')[1].trim() : title;
      
      if (title && link) {
        jobs.push({
          title: cleanTitle,
          sourceUrl: link,
          company: company.trim(),
          location: 'عن بعد',
          description: $(el).find('description').text()
        });
      }
    });
  } catch (error) {
    console.error('Error scraping WeWorkRemotely:', error);
  }
  return jobs;
}

async function scrapeRemoteOK() {
  console.log('Scraping RemoteOK for Remote Jobs...');
  const jobs: any[] = [];
  try {
    const response = await axios.get('https://remoteok.com/api');
    if (Array.isArray(response.data)) {
      // Skip the first item which is legal info
      const validJobs = response.data.slice(1).filter((j: any) => 
        j.location && (j.location.toLowerCase().includes('worldwide') || j.location.toLowerCase().includes('anywhere'))
      ).slice(0, 50); // Limit to 50
      
      validJobs.forEach((item: any) => {
        if (item.position && item.url) {
          jobs.push({
            title: item.position,
            sourceUrl: item.url,
            company: item.company || 'شركة عالمية',
            location: 'عن بعد',
            description: item.description
          });
        }
      });
    }
  } catch (error) {
    console.error('Error scraping RemoteOK:', error);
  }
  return jobs;
}

async function scrapeTelegram() {
  console.log('Scraping Telegram for Syrian Jobs...');
  const jobs: any[] = [];
  // Only using channels that allow web preview (t.me/s/...)
  const channels = ['syriajobs1', 'khotwa_sy', 'alwaha_alsouria', 'wazafne175', 'Jobs_Bank_Syr']; 
  
  for (const channel of channels) {
    try {
      const response = await axios.get(`https://t.me/s/${channel}`, {
        headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
      });
      const $ = cheerio.load(response.data);
      
      $('.tgme_widget_message').each((i, el) => {
        if (jobs.length >= 25) return; // Limit to 25 per channel to avoid quota issues
        
        let htmlText = $(el).find('.tgme_widget_message_text').html() || '';
        htmlText = htmlText.replace(/<br\s*[\/]?>/gi, '\n');
        const cleanText = cheerio.load(htmlText).text().trim();
        const link = $(el).find('.tgme_widget_message_date').attr('href');
        
        // Filter out short messages or non-job related messages
        if (cleanText && cleanText.length > 50 && (cleanText.includes('مطلوب') || cleanText.includes('شاغر') || cleanText.includes('وظيفة') || cleanText.includes('فرصة عمل') || cleanText.includes('يعلن'))) {
          jobs.push({
            title: 'وظيفة من تلغرام', // Placeholder, Gemini will extract the real title
            sourceUrl: link || `https://t.me/s/${channel}`,
            company: 'غير محدد',
            location: 'سوريا',
            description: cleanText,
            type: 'telegram'
          });
        }
      });
    } catch (error) {
      console.error(`Error scraping Telegram channel ${channel}:`, error);
    }
  }
  return jobs;
}

async function scrapeNSJobs() {
  console.log('Scraping NSJobs for Syrian Jobs...');
  const jobs: any[] = [];
  try {
    const response = await axios.get('https://api.nsjobs.net/api/jobs', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (response.data && response.data.data && Array.isArray(response.data.data.data)) {
      const items = response.data.data.data.slice(0, 50); // Limit to 50
      items.forEach((item: any) => {
        if (item.title && item.permanent_link) {
          jobs.push({
            title: item.title,
            sourceUrl: item.permanent_link,
            company: item.client?.name || 'غير محدد',
            location: item.cities_names || 'سوريا',
            description: item.application_link || '',
            type: 'external'
          });
        }
      });
    }
  } catch (error) {
    console.error('Error scraping NSJobs:', error);
  }
  return jobs;
}

export async function scrapeJobs() {
  console.log('Starting job processing pipeline...');
  const formattedJobs: any[] = [];
  const jobsRef = collection(db, 'jobs');

  try {
    // 1. Get jobs from all sources concurrently
    const results = await Promise.allSettled([
      scrapeUNJobs(),
      scrapeTanqeeb(),
      scrapeRemoteTanqeeb(),
      scrapeRemotive(),
      scrapeWeWorkRemotely(),
      scrapeRemoteOK(),
      scrapeTelegram(),
      scrapeNSJobs()
    ]);

    const allSources = results.flatMap(result => 
      result.status === 'fulfilled' ? result.value.map(j => ({ ...j, type: j.type || 'external' })) : []
    );

    console.log(`Total jobs scraped from all sources: ${allSources.length}`);

    // 2. Fetch all existing source URLs and Signatures to avoid sequential DB queries
    console.log('Fetching existing jobs from database to filter duplicates...');
    const existingUrls = new Set<string>();
    const existingSignatures = new Set<string>();
    const allJobsSnapshot = await getDocs(collection(db, 'jobs'));
    allJobsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.sourceUrl) {
        existingUrls.add(data.sourceUrl);
      }
      if (data.title && data.company) {
        const sig = `${data.title.trim().toLowerCase()}-${data.company.trim().toLowerCase()}`;
        existingSignatures.add(sig);
      }
    });

    // 3. Filter out duplicates pre-Gemini
    const seenDescriptions = new Set<string>();
    const newJobs = allSources.filter(job => {
      if (existingUrls.has(job.sourceUrl)) return false;
      
      // For telegram, if the exact same text is in multiple channels, skip it
      if (job.type === 'telegram' && job.description) {
        const descSignature = job.description.trim().substring(0, 150);
        if (seenDescriptions.has(descSignature)) return false;
        seenDescriptions.add(descSignature);
      }
      return true;
    });
    console.log(`Found ${newJobs.length} new jobs to process.`);

    if (newJobs.length === 0) {
      return { added: 0 };
    }

    let globalQuotaExceeded = false;

    // 4. Process new jobs concurrently with a limit (e.g., 3 at a time)
    const CONCURRENCY_LIMIT = 3;
    for (let i = 0; i < newJobs.length; i += CONCURRENCY_LIMIT) {
      const batch = newJobs.slice(i, i + CONCURRENCY_LIMIT);
      
      await Promise.all(batch.map(async (source) => {
        console.log(`Processing new job: ${source.title}`);
        let success = false;

        if (!apiKey || isPlaceholder || globalQuotaExceeded) {
          if (globalQuotaExceeded) {
            console.warn('Skipping Gemini processing due to quota exceeded.');
          } else {
            console.warn('Skipping Gemini processing due to invalid API key.');
          }
        } else {
          const cleanDescription = source.description ? source.description.replace(/<[^>]*>?/gm, '').substring(0, 1000) : '';

          const prompt = source.type === 'telegram' ? `
            لديك إعلان وظيفي تم سحبه من قناة تلغرام بالنص التالي:
            "${cleanDescription}"
            
            المطلوب منك:
            1. استخراج المسمى الوظيفي بدقة من النص.
            2. استخراج اسم المنظمة/الشركة (إذا لم يذكر اكتب "غير محدد").
            3. استخراج موقع العمل (إذا لم يذكر اكتب "سوريا").
            4. توليد وصف وظيفي احترافي ومفصل جداً باللغة العربية بناءً على النص المرفق.
            
            يجب أن يكون حقل "description" منسقاً باستخدام Markdown (بدون استخدام backticks حول النص).
            يجب أن يحتوي الوصف على الأقسام التالية بشكل جذاب:
            - **نبذة عن الوظيفة** (فقرة قصيرة جذابة)
            - **المهام والمسؤوليات** (قائمة نقطية Bullet points)
            - **الشروط والمتطلبات** (قائمة نقطية Bullet points)
            - **ميزات العمل** (إن أمكن، قائمة نقطية)
            - **طريقة التقديم** (استخرج رقم الهاتف أو الإيميل أو الرابط من النص وضعه هنا بشكل واضح)
            
            أعد النتيجة بصيغة JSON فقط:
            {
              "title": "المسمى الوظيفي المستخرج",
              "company": "اسم الشركة المستخرج",
              "location": "موقع العمل المستخرج",
              "type": "دوام كامل",
              "description": "الوصف الوظيفي المنسق بصيغة Markdown هنا...",
              "tags": ["تلغرام", "سوريا", "وظائف"],
              "experienceLevel": "استنتج مستوى الخبرة من النص (مثلاً: مبتدئ، متوسط، خبير). إذا لم تكن متأكداً اكتب 'غير محدد'",
              "deadline": "غير محدد",
              "skills": ["استنتج 3 إلى 6 مهارات مطلوبة لهذه الوظيفة بناءً على النص"]
            }
          ` : `
            لديك وظيفة بالعنوان التالي: "${source.title}" في منظمة/شركة "${source.company}".
            ${cleanDescription ? `تفاصيل الوظيفة الأصلية:\n${cleanDescription}\n\n` : ''}
            المطلوب منك:
            1. ترجمة المسمى الوظيفي إلى لغة عربية احترافية معتمدة في الموارد البشرية.
            2. تعريب اسم المنظمة/الشركة (مثلاً إضافة الاسم بالعربي بجانب الانجليزي).
            3. توليد وصف وظيفي احترافي ومفصل جداً باللغة العربية يتناسب مع هذا المسمى الوظيفي في سياق العمل الإنساني أو عن بعد في سوريا. اعتمد على "تفاصيل الوظيفة الأصلية" إن وجدت لترجمتها وتلخيصها.
            
            يجب أن يكون حقل "description" منسقاً باستخدام Markdown (بدون استخدام backticks حول النص).
            يجب أن يحتوي الوصف على الأقسام التالية بشكل جذاب:
            - **نبذة عن الوظيفة** (فقرة قصيرة جذابة)
            - **المهام والمسؤوليات** (قائمة نقطية Bullet points)
            - **الشروط والمتطلبات** (قائمة نقطية Bullet points)
            - **ميزات العمل** (إن أمكن، قائمة نقطية)
            
            أعد النتيجة بصيغة JSON فقط:
            {
              "title": "المسمى الوظيفي المترجم للغة العربية",
              "company": "اسم المنظمة المعرب (مثال: منظمة الصحة العالمية - WHO)",
              "location": "${source.location === 'عن بعد' ? 'عن بعد' : 'سوريا'}",
              "type": "${source.location === 'عن بعد' ? 'عن بعد' : 'دوام كامل'}",
              "description": "الوصف الوظيفي المنسق بصيغة Markdown هنا...",
              "tags": ["منظمات", "سوريا", "اسم المنظمة"],
              "experienceLevel": "استنتج مستوى الخبرة من العنوان (مثلاً: مبتدئ، متوسط، خبير، إداري). إذا لم تكن متأكداً اكتب 'غير محدد'",
              "deadline": "غير محدد",
              "skills": ["استنتج 3 إلى 6 مهارات مطلوبة لهذه الوظيفة بناءً على العنوان"]
            }
          `;

          let retries = 3;
          let delay = 1000;

          while (retries > 0 && !success && !globalQuotaExceeded) {
            try {
              const aiResponse = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: "application/json" }
              });

              const responseText = aiResponse.text;
              if (!responseText) {
                success = true;
                continue;
              }

              let jobData = JSON.parse(responseText);

              if (jobData.title && jobData.description) {
                const signature = `${jobData.title.trim().toLowerCase()}-${(jobData.company || 'غير محدد').trim().toLowerCase()}`;
                
                if (existingSignatures.has(signature)) {
                  console.log(`Duplicate detected post-AI: ${signature}. Skipping.`);
                  success = true;
                  return; // Use return instead of continue inside map
                }
                existingSignatures.add(signature);

                const slug = generateSlug(jobData.title, jobData.company || 'وظيفة');
                formattedJobs.push({
                  ...jobData,
                  sourceUrl: source.sourceUrl,
                  slug,
                  datePosted: new Date().toISOString(),
                  createdAt: new Date().toISOString()
                });
                console.log(`Prepared: ${jobData.title}`);
              }
              success = true;
            } catch (aiError: any) {
              if (aiError.message && aiError.message.includes('Quota exceeded')) {
                console.error('Gemini API quota exceeded. Switching to fallback mode.');
                globalQuotaExceeded = true;
                break;
              }

              retries--;
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
              }
            }
          }
        }

        if (!success) {
          if (source.type === 'telegram') {
            console.log(`Skipping fallback for Telegram job due to missing information.`);
            return;
          }
          
          console.log(`Using fallback for: ${source.title}`);
          const signature = `${source.title.trim().toLowerCase()}-${(source.company || 'غير محدد').trim().toLowerCase()}`;
          
          if (existingSignatures.has(signature) && source.type !== 'telegram') {
            console.log(`Duplicate detected in fallback: ${signature}. Skipping.`);
            return; // Use return instead of continue inside map/forEach
          }
          existingSignatures.add(signature);

          const slug = generateSlug(source.title, source.company || 'وظيفة');
          formattedJobs.push({
            title: source.title,
            company: source.company || 'غير محدد',
            location: source.location || 'سوريا',
            type: 'دوام كامل',
            description: `مطلوب ${source.title} للعمل في ${source.company || 'منظمة'}. يرجى زيارة الرابط المرفق لمزيد من التفاصيل والتقديم.`,
            tags: ['منظمات', 'سوريا', source.company || ''].filter(Boolean),
            sourceUrl: source.sourceUrl,
            slug,
            datePosted: new Date().toISOString(),
            createdAt: new Date().toISOString()
          });
        }
      }));
    }

    return formattedJobs;
  } catch (error) {
    console.error('Error in pipeline:', error);
    throw error;
  }
}
