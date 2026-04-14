import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

async function cleanup() {
  console.log('Starting cleanup...');
  const jobsRef = collection(db, 'jobs');
  const q = query(jobsRef, where('title', '==', 'وظيفة من تلغرام'));
  
  const snapshot = await getDocs(q);
  console.log(`Found ${snapshot.size} jobs to delete.`);
  
  let deleted = 0;
  for (const document of snapshot.docs) {
    await deleteDoc(doc(db, 'jobs', document.id));
    deleted++;
  }
  console.log(`Deleted ${deleted} jobs.`);
  process.exit(0);
}

cleanup().catch(console.error);