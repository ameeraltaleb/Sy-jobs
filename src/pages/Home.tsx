import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { MapPin, Clock, Building, ChevronLeft, Search as SearchIcon, Filter, X, Briefcase } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CATEGORIES_DATA } from './Categories';
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
  tags: string[];
  category?: string;
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const JOBS_PER_PAGE = 10;
  
  // URL Params
  const urlSearchTerm = searchParams.get('q') || '';
  const selectedLocation = searchParams.get('location') || '';
  const selectedCategory = searchParams.get('category') || '';
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(selectedCategory ? [selectedCategory] : []);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Local state for search input to avoid URL updates on every keystroke
  const [localSearchTerm, setLocalSearchTerm] = useState(urlSearchTerm);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'jobs'), orderBy('datePosted', 'desc'), limit(100));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let fetchedJobs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];

      // Apply filters client-side
      if (urlSearchTerm) {
        const lowerSearch = urlSearchTerm.toLowerCase();
        fetchedJobs = fetchedJobs.filter(job => 
          job.title.toLowerCase().includes(lowerSearch) || 
          job.company.toLowerCase().includes(lowerSearch) ||
          job.description.toLowerCase().includes(lowerSearch)
        );
      }

      if (selectedLocation) {
        fetchedJobs = fetchedJobs.filter(job => job.location.includes(selectedLocation));
      }

      if (selectedTypes.length > 0) {
        fetchedJobs = fetchedJobs.filter(job => selectedTypes.includes(job.type));
      }

      if (selectedCategories.length > 0) {
        fetchedJobs = fetchedJobs.filter(job => {
          const searchableText = `${job.title || ''} ${job.description || ''} ${(job.tags || []).join(' ')}`.toLowerCase();
          return selectedCategories.some(catId => {
            const category = CATEGORIES_DATA.find(c => c.id === catId);
            if (!category) return false;
            return category.keywords.some(keyword => searchableText.includes(keyword.toLowerCase()));
          });
        });
      }

      setJobs(fetchedJobs);
      setCurrentPage(1); // Reset to first page when filters change
      setLoading(false);
    }, (error) => {
      console.error("Error fetching jobs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [urlSearchTerm, selectedLocation, selectedTypes, selectedCategories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: localSearchTerm });
  };

  const updateFilters = (newParams: Record<string, string>) => {
    const current = Object.fromEntries(searchParams.entries());
    const updated = { ...current, ...newParams };
    // Remove empty params
    Object.keys(updated).forEach(key => {
      if (!updated[key]) delete updated[key];
    });
    setSearchParams(updated);
  };

  const handleLocationChange = (location: string) => {
    updateFilters({ location });
  };

  const handleTypeChange = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const totalPages = Math.ceil(jobs.length / JOBS_PER_PAGE);
  const currentJobs = jobs.slice((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE);

  const filterContent = (
    <>
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          نوع العمل
        </h3>
        <div className="space-y-3">
          {['دوام كامل', 'دوام جزئي', 'عن بعد', 'تدريب', 'عمل حر'].map(type => (
            <label key={type} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5">
                <input 
                  type="checkbox" 
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                  checked={selectedTypes.includes(type)}
                  onChange={() => handleTypeChange(type)}
                />
                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-gray-700 group-hover:text-blue-600 transition-colors">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          المجال
        </h3>
        <div className="space-y-3">
          {CATEGORIES_DATA.map(category => (
            <label key={category.id} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5">
                <input 
                  type="checkbox" 
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => {
                    setSelectedCategories(prev => 
                      prev.includes(category.id) ? prev.filter(c => c !== category.id) : [...prev, category.id]
                    );
                  }}
                />
                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-gray-700 group-hover:text-blue-600 transition-colors">{category.name}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <>
      <Helmet>
        <title>فرص عمل سوريا | أحدث الوظائف الشاغرة</title>
        <meta name="description" content="ابحث عن أحدث فرص العمل والوظائف الشاغرة في سوريا. تصفح آلاف الوظائف في دمشق، حلب، اللاذقية، حمص وغيرها من المحافظات." />
        <link rel="canonical" href="https://syriajobs.net/" />
        <meta property="og:title" content="فرص عمل سوريا | أحدث الوظائف الشاغرة" />
        <meta property="og:description" content="ابحث عن أحدث فرص العمل والوظائف الشاغرة في سوريا. تصفح آلاف الوظائف في دمشق، حلب، اللاذقية، حمص وغيرها من المحافظات." />
        <meta property="og:url" content="https://syriajobs.net/" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-3xl py-10 px-6 sm:py-14 sm:px-8 text-center text-white mb-10 shadow-xl overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
            اكتشف فرصتك القادمة في سوريا
          </h1>
          <p className="text-blue-100 text-base md:text-lg mb-8 max-w-2xl mx-auto font-medium leading-relaxed">
            نجمع لك أفضل الوظائف من مختلف المصادر والشركات في مكان واحد، لنسهل عليك رحلة البحث عن عمل.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md p-1.5 rounded-2xl flex flex-col md:flex-row gap-2 shadow-lg border border-white/20">
            <div className="flex-1 flex items-center bg-white rounded-xl px-3 py-1 transition-shadow focus-within:ring-2 focus-within:ring-blue-400">
              <SearchIcon className="w-5 h-5 text-gray-400 ml-2" />
              <input 
                type="text" 
                placeholder="المسمى الوظيفي، المهارة، أو الشركة..." 
                className="w-full py-2.5 text-gray-900 bg-transparent border-none focus:ring-0 outline-none placeholder-gray-400 text-sm sm:text-base"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-56 flex items-center bg-white rounded-xl px-3 py-1 transition-shadow focus-within:ring-2 focus-within:ring-blue-400">
              <MapPin className="w-5 h-5 text-gray-400 ml-2" />
              <select 
                className="w-full py-2.5 text-gray-700 bg-transparent border-none focus:ring-0 outline-none appearance-none cursor-pointer text-sm sm:text-base"
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
              >
                <option value="">كل المدن</option>
                <option value="دمشق">دمشق</option>
                <option value="ريف دمشق">ريف دمشق</option>
                <option value="حلب">حلب</option>
                <option value="حمص">حمص</option>
                <option value="حماة">حماة</option>
                <option value="اللاذقية">اللاذقية</option>
                <option value="طرطوس">طرطوس</option>
                <option value="إدلب">إدلب</option>
                <option value="درعا">درعا</option>
                <option value="السويداء">السويداء</option>
                <option value="القنيطرة">القنيطرة</option>
                <option value="دير الزور">دير الزور</option>
                <option value="الرقة">الرقة</option>
                <option value="الحسكة">الحسكة</option>
                <option value="عن بعد">عن بعد</option>
              </select>
            </div>

            <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-base hover:bg-blue-500 transition-colors shadow-md">
              بحث
            </button>
          </form>
        </div>
      </section>

      {/* AdSense Placeholder - Top */}
      <div className="w-full h-24 bg-gray-100 rounded-2xl mb-12 flex items-center justify-center text-gray-400 border-2 border-gray-200 border-dashed">
        <span className="font-medium">مساحة إعلانية (AdSense)</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6 pb-4 border-b border-gray-100">تصفية النتائج</h2>
            {filterContent}
          </div>
        </aside>

        {/* Job Listings */}
        <div className="col-span-1 lg:col-span-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">أحدث الوظائف</h2>
              <p className="text-gray-500 mt-1">عرض {jobs.length} وظيفة متاحة</p>
            </div>
            
            {/* Mobile Filter Button */}
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-gray-800 font-bold hover:bg-gray-50 w-full sm:w-auto shadow-sm transition-all active:scale-95"
            >
              <Filter className="w-5 h-5" />
              تصفية النتائج
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">جاري تحميل الوظائف...</p>
            </div>
          ) : currentJobs.length > 0 ? (
            <div className="space-y-5">
              {currentJobs.map((job, index) => (
                <React.Fragment key={job.id}>
                  <Link 
                    to={`/job/${job.slug}`}
                    className="block bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2">
                          {job.title}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md font-medium border border-gray-100">
                            <Building className="w-4 h-4 text-gray-400" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-500">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-500">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {job.datePosted ? formatDistanceToNow(new Date(job.datePosted), { addSuffix: true, locale: ar }) : 'مؤخراً'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100 mt-2 sm:mt-0">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap">
                          {job.type}
                        </span>
                        <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors group-hover:translate-x-1" />
                      </div>
                    </div>
                    
                    <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed mt-2">
                      {job.description}
                    </p>
                    
                    <div className="mt-5 flex flex-wrap gap-2">
                      {job.tags?.slice(0, 5).map(tag => (
                        <span key={tag} className="bg-gray-50 border border-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                      {job.tags && job.tags.length > 5 && (
                        <span className="bg-gray-50 border border-gray-100 text-gray-500 px-2.5 py-1 rounded-md text-xs font-medium">
                          +{job.tags.length - 5}
                        </span>
                      )}
                    </div>
                  </Link>
                  
                  {/* Inject Native Ad after every 5 jobs */}
                  {(index + 1) % 5 === 0 && <NativeAd />}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-500 max-w-sm mx-auto">لم نتمكن من العثور على وظائف تطابق معايير البحث الخاصة بك. جرب تغيير كلمات البحث أو الفلاتر.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <nav className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  السابق
                </button>
                
                <div className="hidden sm:flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button 
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                        currentPage === page 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                {/* Mobile page indicator */}
                <span className="sm:hidden text-gray-600 font-medium px-4">
                  {currentPage} / {totalPages}
                </span>

                <button 
                  onClick={() => {
                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  التالي
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" dir="rtl">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileFiltersOpen(false)}></div>
          <div className="relative w-full max-w-xs bg-white h-full overflow-y-auto p-6 shadow-2xl ml-auto transform transition-transform">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-extrabold text-gray-900">تصفية النتائج</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {filterContent}
            
            <div className="sticky bottom-0 left-0 right-0 pt-6 pb-2 bg-white border-t border-gray-100 mt-8">
              <button 
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                عرض النتائج
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
