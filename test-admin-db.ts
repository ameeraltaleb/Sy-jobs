import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

(async () => {
  try {
    const app = initializeApp({
      projectId: firebaseConfig.projectId,
      credential: applicationDefault()
    });
    const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    console.log('Fetching...');
    const snap = await db.collection('settings').limit(1).get();
    console.log('Success!', snap.size);
  } catch (err) {
    console.error('Error:', err);
  }
})();
