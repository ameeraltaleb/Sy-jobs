import { scrapeJobs } from './src/services/scraper.ts';
import { db } from './firebase.ts';
import { collection, addDoc } from 'firebase/firestore';

async function run() {
  console.log("Fetching jobs...");
  try {
    const jobs = await scrapeJobs();
    console.log(`Found ${jobs.length} jobs. Inserting into database...`);
    const jobsRef = collection(db, 'jobs');
    let count = 0;
    for (const job of jobs) {
      await addDoc(jobsRef, job);
      count++;
    }
    console.log(`Successfully added ${count} jobs.`);
    process.exit(0);
  } catch (error) {
    console.error("Error inserting jobs:", error);
    process.exit(1);
  }
}

run();
