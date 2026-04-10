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
      if (jobs.length >= 10) return; // Limit to 10 to avoid quota issues
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
      if (jobs.length >= 10) return; // Limit to 10
      
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

export async function scrapeJobs() {
  console.log('Starting job processing pipeline...');
  let addedCount = 0;
  const jobsRef = collection(db, 'jobs');

  try {
    // 1. Get jobs from all sources concurrently
    const [unJobsResult, tanqeebResult] = await Promise.allSettled([
      scrapeUNJobs(),
      scrapeTanqeeb()
    ]);

    const unJobs = unJobsResult.status === 'fulfilled' ? unJobsResult.value : [];
    const tanqeebJobs = tanqeebResult.status === 'fulfilled' ? tanqeebResult.value : [];

    console.log(`Found ${unJobs.length} jobs on UNJobs.`);
    console.log(`Found ${tanqeebJobs.length} jobs on Tanqeeb.`);

    // Combine all sources
    const allSources = [
      ...unJobs.map(j => ({ ...j, type: 'external' })),
      ...tanqeebJobs.map(j => ({ ...j, type: 'external' }))
    ];

    let globalQuotaExceeded = false;

    for (const source of allSources) {
      console.log(`Processing source: ${source.sourceUrl}`);
      // Check for duplicates
      const q = query(jobsRef, where('sourceUrl', '==', source.sourceUrl));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log(`Duplicate found for: ${source.sourceUrl}`);
        continue;
      }

      console.log(`New job found: ${source.title || 'Telegram Job'}. Calling Gemini...`);
      
      let success = false;

      if (!apiKey || isPlaceholder || globalQuotaExceeded) {
        if (globalQuotaExceeded) {
          console.warn('Skipping Gemini processing due to quota exceeded.');
        } else {
          console.warn('Skipping Gemini processing due to invalid API key.');
        }
      } else {
        // Add delay for Gemini API limits
        await new Promise(resolve => setTimeout(resolve, 2000));

        // For UNJobs, we use Gemini to generate a better Arabic description based on the title and company
        const prompt = `
          لديك وظيفة بالعنوان التالي: "${source.title}" في منظمة "${source.company}".
          المطلوب منك:
          1. ترجمة المسمى الوظيفي إلى لغة عربية احترافية معتمدة في الموارد البشرية.
          2. تعريب اسم المنظمة/الشركة (مثلاً إضافة الاسم بالعربي بجانب الانجليزي).
          3. توليد وصف وظيفي احترافي ومفصل جداً باللغة العربية يتناسب مع هذا المسمى الوظيفي في سياق العمل الإنساني في سوريا.
          
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
            "location": "سوريا",
            "type": "دوام كامل",
            "description": "الوصف الوظيفي المنسق بصيغة Markdown هنا...",
            "tags": ["منظمات", "سوريا", "اسم المنظمة"],
            "experienceLevel": "استنتج مستوى الخبرة من العنوان (مثلاً: مبتدئ، متوسط، خبير، إداري). إذا لم تكن متأكداً اكتب 'غير محدد'",
            "deadline": "غير محدد",
            "skills": ["استنتج 3 إلى 6 مهارات مطلوبة لهذه الوظيفة بناءً على العنوان"]
          }
        `;

        let retries = 3;
        let delay = 2000;

        while (retries > 0 && !success && !globalQuotaExceeded) {
          try {
            const aiResponse = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: prompt,
              config: { responseMimeType: "application/json" }
            });

            const responseText = aiResponse.text;
            console.log(`Gemini response for ${source.title || 'Telegram'}:`, responseText);
            if (!responseText) {
              success = true; // No text, but not an error, so we can move on
              continue;
            }

            let jobData = JSON.parse(responseText);

            if (jobData.title && jobData.description) {
              const slug = generateSlug(jobData.title, jobData.company || 'وظيفة');
              await addDoc(jobsRef, {
                ...jobData,
                sourceUrl: source.sourceUrl,
                slug,
                datePosted: new Date().toISOString(),
                createdAt: new Date().toISOString()
              });
              addedCount++;
              console.log(`Added: ${jobData.title}`);
            }
            success = true; // Successfully processed
          } catch (aiError: any) {
            console.error(`Error with Gemini AI (Retries left: ${retries - 1}):`, aiError.message || aiError);
            
            if (aiError.message && aiError.message.includes('Quota exceeded')) {
              console.error('Gemini API quota exceeded. Switching to fallback mode for remaining jobs.');
              globalQuotaExceeded = true;
              break;
            }

            retries--;
            if (retries > 0) {
              console.log(`Waiting ${delay / 1000} seconds before retrying...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2; // Exponential backoff
            } else {
              console.error('Failed to process with Gemini after multiple attempts.');
            }
          }
        }
      }

      if (!success) {
        console.log(`Using fallback for: ${source.title}`);
        const slug = generateSlug(source.title, source.company || 'وظيفة');
        await addDoc(jobsRef, {
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
        addedCount++;
        console.log(`Added (Fallback): ${source.title}`);
      }
    }

    return { added: addedCount };
  } catch (error) {
    console.error('Error in pipeline:', error);
    throw error;
  }
}
