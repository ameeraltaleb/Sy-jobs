import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { MapPin, Clock, Building, Share2, Bookmark, ArrowRight, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
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
  sourceUrl: string;
  tags: string[];
}

export default function JobDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setIsSaved(savedJobs.includes(slug));

    async function fetchJob() {
      if (!slug) return;
      
      try {
        const q = query(collection(db, 'jobs'), where('slug', '==', slug), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setJob({ id: doc.id, ...doc.data() } as Job);
        } else {
          setJob(null);
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [slug]);

  const toggleSave = () => {
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    let newSavedJobs;
    if (isSaved) {
      newSavedJobs = savedJobs.filter((id: string) => id !== slug);
    } else {
      newSavedJobs = [...savedJobs, slug];
    }
    localStorage.setItem('savedJobs', JSON.stringify(newSavedJobs));
    setIsSaved(!isSaved);
  };

  if (loading) {
    return (
      <div className="animate-pulse max-w-4xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">عذراً، الوظيفة غير موجودة</h2>
        <p className="text-gray-600 mb-8">قد تكون الوظيفة قد حذفت أو انتهت صلاحيتها.</p>
        <Link to="/" className="text-blue-600 hover:underline font-medium">العودة للرئيسية</Link>
      </div>
    );
  }

  // Schema.org JSON-LD for JobPosting
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.datePosted,
    "employmentType": job.type === 'دوام كامل' ? 'FULL_TIME' : job.type === 'دوام جزئي' ? 'PART_TIME' : 'OTHER',
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location,
        "addressCountry": "SY"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{`${job.title} في ${job.company} - فرص عمل سوريا`}</title>
        <meta name="description" content={`مطلوب ${job.title} للعمل في ${job.company} في ${job.location}. اقرأ التفاصيل وقدم الآن.`} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowRight className="w-4 h-4" />
          العودة للوظائف
        </Link>

        {/* Job Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1.5 font-medium text-gray-900">
                  <Building className="w-5 h-5 text-gray-400" />
                  {job.company}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-5 h-5 text-gray-400" />
                  {job.datePosted ? formatDistanceToNow(new Date(job.datePosted), { addSuffix: true, locale: ar }) : 'مؤخراً'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={toggleSave}
                className={`p-3 rounded-xl transition-colors border ${
                  isSaved 
                    ? 'bg-blue-50 text-blue-600 border-blue-200' 
                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 border-gray-200'
                }`}
                title={isSaved ? 'إزالة من المحفوظات' : 'حفظ الوظيفة'}
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <button className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-gray-200">
                <Share2 className="w-5 h-5" />
              </button>
              <a 
                href={job.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 md:flex-none bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors text-center"
              >
                التقديم الآن
              </a>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100">
            <div className="bg-gray-50 px-4 py-2 rounded-lg text-sm text-gray-700 flex items-center gap-2">
              <span className="font-medium">نوع العمل:</span> {job.type}
            </div>
            {job.datePosted && (
              <div className="bg-gray-50 px-4 py-2 rounded-lg text-sm text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="font-medium">تاريخ النشر:</span> {format(new Date(job.datePosted), 'dd MMMM yyyy', { locale: ar })}
              </div>
            )}
          </div>
        </div>

        {/* AdSense Placeholder - Middle */}
        <div className="w-full h-24 bg-gray-200 rounded-xl mb-8 flex items-center justify-center text-gray-400 border border-gray-300 border-dashed">
          <span>مساحة إعلانية (AdSense)</span>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">وصف الوظيفة</h2>
          <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
            {job.description}
          </div>

          {job.tags && job.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">الكلمات المفتاحية</h3>
              <div className="flex flex-wrap gap-2">
                {job.tags.map(tag => (
                  <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Important Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <h3 className="text-yellow-800 font-bold mb-2">تنويه هام</h3>
          <p className="text-yellow-700 text-sm leading-relaxed">
            موقع "فرص عمل سوريا" هو محرك بحث للوظائف ولا يمثل الشركات المعلنة. يرجى الحذر وعدم دفع أي مبالغ مالية لأي جهة تطلب رسوماً مقابل التوظيف.
          </p>
        </div>
      </div>
    </>
  );
}
