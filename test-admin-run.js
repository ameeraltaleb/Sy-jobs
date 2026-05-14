const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const firebaseConfig = require('./firebase-applet-config.json');

(async () => {
  try {
    const app = initializeApp({ projectId: firebaseConfig.projectId });
    const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    console.log('Fetching...');
    const snap = await db.collection('settings').limit(1).get();
    console.log('Success!', snap.size);
  } catch (err) {
    console.error('Error:', err);
  }
})();
