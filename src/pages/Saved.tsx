import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Bookmark, Building, MapPin, Clock, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  slug: string;
  datePosted: string;
}

export default function Saved() {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSavedJobs() {
      const savedIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      if (savedIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const chunks = [];
        for (let i = 0; i < savedIds.length; i += 10) {
          chunks.push(savedIds.slice(i, i + 10));
        }

        const jobsPromises = chunks.map(async (chunk) => {
          const q = query(collection(db, 'jobs'), where('slug', 'in', chunk));
          const querySnapshot = await getDocs(q);
          return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Job[];
        });

        const jobsArrays = await Promise.all(jobsPromises);
        const allJobs = jobsArrays.flat();
        setSavedJobs(allJobs);
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSavedJobs();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>الوظائف المحفوظة | فرص عمل سوريا</title>
        <meta name="description" content="قائمة الوظائف التي قمت بحفظها للرجوع إليها لاحقاً." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">الوظائف المحفوظة</h1>
        
        {savedJobs.length > 0 ? (
          <div className="space-y-4">
            {savedJobs.map(job => (
              <Link 
                key={job.id} 
                to={`/job/${job.slug}`}
                className="block bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all group"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.datePosted ? formatDistanceToNow(new Date(job.datePosted), { addSuffix: true, locale: ar }) : 'مؤخراً'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                      {job.type}
                    </span>
                    <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors hidden sm:block" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 text-gray-400 mb-6">
              <Bookmark className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">لا توجد وظائف محفوظة</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              لم تقم بحفظ أي وظيفة حتى الآن. تصفح الوظائف المتاحة واحفظ الوظائف التي تهمك للرجوع إليها لاحقاً.
            </p>
            <Link 
              to="/" 
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              تصفح الوظائف
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
