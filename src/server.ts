import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cron from 'node-cron';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { scrapeJobs } from './services/scraper.js';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY2;
if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
  console.error('CRITICAL: GEMINI_API_KEY2 is missing or invalid.');
  console.error('Please ensure GEMINI_API_KEY2 is set in Settings > Secrets with your real key.');
} else {
  console.log('GEMINI_API_KEY2 is present and appears valid.');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for development/vite
  }));
  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Dynamic Sitemap for Google Search Console
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'jobs'));
      const jobs = querySnapshot.docs.map(doc => doc.data());
      
      // Get the base URL from environment or use a default (replace with your actual domain later)
      const baseUrl = process.env.APP_URL || 'https://syrian-jobs.com'; 

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      // Add static pages
      const staticPages = ['', '/saved', '/contact'];
      staticPages.forEach(page => {
        xml += `  <url>\n    <loc>${baseUrl}${page}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
      });

      // Add dynamic job pages
      jobs.forEach(job => {
        if (job.slug) {
          xml += `  <url>\n    <loc>${baseUrl}/job/${job.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
        }
      });

      xml += '</urlset>';

      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).end();
    }
  });

  app.post('/api/scrape', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY2;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(500).json({ 
        success: false, 
        error: 'Invalid Gemini API Key. Please ensure GEMINI_API_KEY2 is set in Settings > Secrets.' 
      });
    }
    try {
      const result = await scrapeJobs();
      res.json({ success: true, message: 'Scraping completed', result });
    } catch (error) {
      console.error('Scraping error:', error);
      res.status(500).json({ success: false, error: 'Scraping failed' });
    }
  });

  app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'الرجاء تعبئة جميع الحقول المطلوبة' });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || 'ameeraltaleb@gmail.com',
          pass: process.env.SMTP_PASS || 'your_app_password_here', // User needs to set this in Settings > Secrets
        },
      });

      await transporter.sendMail({
        from: `"${name}" <${process.env.SMTP_USER || 'ameeraltaleb@gmail.com'}>`,
        replyTo: email,
        to: 'ameeraltaleb@gmail.com',
        subject: `رسالة جديدة من الموقع: ${subject || 'بدون موضوع'}`,
        text: `الاسم: ${name}\nالبريد الإلكتروني: ${email}\n\nالرسالة:\n${message}`,
      });

      res.json({ success: true, message: 'تم إرسال الرسالة بنجاح' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ success: false, error: 'حدث خطأ أثناء إرسال الرسالة. يرجى التأكد من إعدادات SMTP.' });
    }
  });

  // Schedule scraping job (runs every hour)
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled job scraping...');
    try {
      await scrapeJobs();
    } catch (error) {
      console.error('Scheduled scraping failed:', error);
    }
  });

  // Run once on startup for demonstration purposes
  setTimeout(async () => {
    console.log('Running initial job scraping on startup...');
    try {
      await scrapeJobs();
    } catch (error) {
      console.error('Initial scraping failed:', error);
    }
  }, 5000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
