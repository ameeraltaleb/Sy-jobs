import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { MapPin, Clock, Building, ChevronLeft, Search as SearchIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CATEGORIES_DATA } from './Categories';

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

  return (
    <>
      <Helmet>
        <title>فرص عمل سوريا | أحدث الوظائف الشاغرة</title>
        <meta name="description" content="ابحث عن أحدث فرص العمل والوظائف الشاغرة في سوريا. تصفح آلاف الوظائف في دمشق، حلب، اللاذقية، حمص وغيرها من المحافظات." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-blue-600 rounded-2xl p-8 md:p-12 text-center text-white mb-12 shadow-lg">
        <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
          اكتشف فرصتك القادمة في سوريا
        </h1>
        <p className="text-blue-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          نجمع لك أفضل الوظائف من مختلف المصادر والشركات في مكان واحد، لنسهل عليك رحلة البحث عن عمل.
        </p>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto bg-white rounded-xl p-2 flex flex-col md:flex-row gap-2 shadow-md">
          <div className="flex-1 flex items-center px-4">
            <SearchIcon className="w-5 h-5 text-gray-400 ml-2" />
            <input 
              type="text" 
              placeholder="المسمى الوظيفي، المهارة، أو الشركة..." 
              className="w-full py-3 text-gray-900 bg-transparent border-none focus:ring-0 outline-none"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-[1px] h-[1px] md:h-auto bg-gray-200 my-2 md:my-0 md:mx-2"></div>
          <select 
            className="px-4 py-3 text-gray-600 bg-transparent border-none focus:ring-0 outline-none md:w-48"
            value={selectedLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
          >
            <option value="">كل المدن</option>
            <option value="دمشق">دمشق</option>
            <option value="حلب">حلب</option>
            <option value="اللاذقية">اللاذقية</option>
            <option value="حمص">حمص</option>
            <option value="عن بعد">عن بعد</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            بحث
          </button>
        </form>
      </section>

      {/* AdSense Placeholder - Top */}
      <div className="w-full h-24 bg-gray-200 rounded-xl mb-12 flex items-center justify-center text-gray-400 border border-gray-300 border-dashed">
        <span>مساحة إعلانية (AdSense)</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6">تصفية النتائج</h2>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">نوع العمل</h3>
              <div className="space-y-2">
                {['دوام كامل', 'دوام جزئي', 'عن بعد', 'تدريب', 'عمل حر'].map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleTypeChange(type)}
                    />
                    <span className="text-gray-600">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">المجال</h3>
              <div className="space-y-2">
                {CATEGORIES_DATA.map(category => (
                  <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => {
                        setSelectedCategories(prev => 
                          prev.includes(category.id) ? prev.filter(c => c !== category.id) : [...prev, category.id]
                        );
                      }}
                    />
                    <span className="text-gray-600">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Job Listings */}
        <div className="col-span-1 lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">أحدث الوظائف</h2>
            <span className="text-gray-500 text-sm">عرض {jobs.length} وظيفة</span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : currentJobs.length > 0 ? (
            <div className="space-y-4">
              {currentJobs.map(job => (
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
                  
                  <p className="mt-4 text-gray-600 line-clamp-2 text-sm leading-relaxed">
                    {job.description}
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.tags?.map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500">لا توجد وظائف متاحة حالياً. يرجى المحاولة لاحقاً.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  السابق
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === page 
                        ? 'bg-blue-600 text-white' 
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button 
                  onClick={() => {
                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  التالي
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
