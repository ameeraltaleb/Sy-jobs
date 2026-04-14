import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { MapPin, Clock, Building, Share2, Bookmark, ArrowRight, Calendar, Briefcase, Star, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Markdown from 'react-markdown';
import NativeAd from '../components/NativeAd';

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
  experienceLevel?: string;
  deadline?: string;
  skills?: string[];
}

export default function JobDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [shareText, setShareText] = useState('');

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
          const jobData = { id: doc.id, ...doc.data() } as Job;
          setJob(jobData);

          // Fetch related jobs (just recent ones for now, excluding current)
          const relatedQ = query(collection(db, 'jobs'), orderBy('datePosted', 'desc'), limit(4));
          const relatedSnap = await getDocs(relatedQ);
          const rJobs = relatedSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as Job))
            .filter(j => j.id !== doc.id)
            .slice(0, 3);
          setRelatedJobs(rJobs);

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

  const handleShare = async () => {
    const shareData = {
      title: `${job?.title} - ${job?.company}`,
      text: `شاهد هذه الوظيفة: ${job?.title} في ${job?.company} عبر منصة فرص عمل سوريا`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareText('تم النسخ!');
      setTimeout(() => setShareText(''), 2000);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse max-w-4xl mx-auto">
        <div className="h-8 bg-gray-200 rounded-lg w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="h-64 bg-gray-200 rounded-2xl mb-8"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">عذراً، الوظيفة غير موجودة</h2>
        <p className="text-gray-600 mb-8">قد تكون الوظيفة قد حذفت أو انتهت صلاحيتها.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
          <ArrowRight className="w-5 h-5" />
          العودة للرئيسية
        </Link>
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
        <link rel="canonical" href={`https://syriajobs.net/job/${job.slug}`} />
        <meta property="og:title" content={`${job.title} في ${job.company} - فرص عمل سوريا`} />
        <meta property="og:description" content={`مطلوب ${job.title} للعمل في ${job.company} في ${job.location}. اقرأ التفاصيل وقدم الآن.`} />
        <meta property="og:url" content={`https://syriajobs.net/job/${job.slug}`} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors font-medium">
          <ArrowRight className="w-4 h-4" />
          العودة للوظائف
        </Link>

        {/* Job Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="flex items-start gap-5">
              {/* Company Logo Placeholder */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-3xl shadow-sm">
                {job.company.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 leading-tight">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-gray-600">
                  <span className="flex items-center gap-1.5 font-medium text-gray-900 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                    <Building className="w-4 h-4 text-gray-400" />
                    {job.company}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {job.datePosted ? formatDistanceToNow(new Date(job.datePosted), { addSuffix: true, locale: ar }) : 'مؤخراً'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={toggleSave}
                className={`p-3.5 rounded-xl transition-all border ${
                  isSaved 
                    ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' 
                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 border-gray-200 hover:border-blue-200'
                }`}
                title={isSaved ? 'إزالة من المحفوظات' : 'حفظ الوظيفة'}
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <div className="relative">
                <button 
                  onClick={handleShare}
                  className="p-3.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-gray-200 hover:border-blue-200"
                  title="مشاركة الوظيفة"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                {shareText && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1.5 px-3 rounded-lg whitespace-nowrap shadow-lg">
                    {shareText}
                  </span>
                )}
              </div>
              <a 
                href={job.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 md:flex-none bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all text-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                التقديم الآن
              </a>
            </div>
          </div>

          {/* Quick Facts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-gray-100">
            <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm font-medium">نوع العمل</span>
              </div>
              <p className="font-bold text-gray-900">{job.type}</p>
            </div>
            <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">مستوى الخبرة</span>
              </div>
              <p className="font-bold text-gray-900">{job.experienceLevel || 'غير محدد'}</p>
            </div>
            <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">تاريخ النشر</span>
              </div>
              <p className="font-bold text-gray-900">
                {job.datePosted ? format(new Date(job.datePosted), 'dd MMM yyyy', { locale: ar }) : 'مؤخراً'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">الموعد النهائي</span>
              </div>
              <p className="font-bold text-gray-900">{job.deadline || 'غير محدد'}</p>
            </div>
          </div>
        </div>

        {/* AdSense Placeholder - Middle */}
        <div className="w-full h-24 bg-gray-100 rounded-2xl mb-8 flex items-center justify-center text-gray-400 border-2 border-gray-200 border-dashed">
          <span className="font-medium">مساحة إعلانية (AdSense)</span>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">وصف الوظيفة</h2>
          <div className="prose prose-blue prose-lg max-w-none text-gray-600 leading-relaxed">
            <Markdown>{job.description}</Markdown>
          </div>

          {job.skills && job.skills.length > 0 && (
            <div className="mt-10 pt-8 border-t border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-900 mb-5">المهارات المطلوبة</h3>
              <div className="flex flex-wrap gap-3">
                {job.skills.map(skill => (
                  <span key={skill} className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.tags && job.tags.length > 0 && (
            <div className="mt-10 pt-8 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">الكلمات المفتاحية</h3>
              <div className="flex flex-wrap gap-2">
                {job.tags.map(tag => (
                  <span key={tag} className="bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Native Ad injected after job description */}
          <div className="mt-10 pt-8 border-t border-gray-100">
            <NativeAd />
          </div>

          {/* Bottom Apply Button */}
          <div className="mt-10 flex justify-center">
            <a 
              href={job.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full md:w-auto bg-blue-600 text-white px-12 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all text-center shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              التقديم على هذه الوظيفة
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        {/* Important Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 sm:p-8 mb-12">
          <h3 className="text-yellow-800 font-bold mb-3 text-lg">تنويه هام</h3>
          <p className="text-yellow-700 text-base leading-relaxed">
            موقع "فرص عمل سوريا" هو محرك بحث للوظائف ولا يمثل الشركات المعلنة. يرجى الحذر وعدم دفع أي مبالغ مالية لأي جهة تطلب رسوماً مقابل التوظيف.
          </p>
        </div>

        {/* Related Jobs */}
        {relatedJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8">وظائف قد تهمك</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedJobs.map(rJob => (
                <Link 
                  key={rJob.id} 
                  to={`/job/${rJob.slug}`}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group hover:-translate-y-1"
                >
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2 leading-snug">{rJob.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="line-clamp-1 font-medium">{rJob.company}</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <span className="text-xs text-gray-500 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                      <MapPin className="w-3 h-3" /> {rJob.location}
                    </span>
                    <span className="text-blue-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                      التفاصيل <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
