import { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase';
import { collection, query, getDocs, deleteDoc, doc, updateDoc, orderBy, setDoc, getDoc, addDoc } from 'firebase/firestore';
import { Briefcase, Users, CheckCircle, Clock, Trash2, Edit, Plus, Search, ExternalLink, Filter, Settings as SettingsIcon, Layout as LayoutIcon, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const ADMIN_EMAILS = ['ameeraltaleb@gmail.com']; // Hardcoded for security, can be moved to Firestore

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'settings'>('jobs');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [submittingSettings, setSubmittingSettings] = useState(false);
  const navigate = useNavigate();

  const handleScrapeJobs = async () => {
    if (!window.confirm('هل أنت متأكد من رغبتك في جلب وظائف جديدة عبر Scraping؟ قد يستغرق هذا بعض الوقت وعدة ثوانٍ.')) return;
    setIsScraping(true);
    try {
      const res = await fetch('/api/scrape', { method: 'POST' });
      const data = await res.json();
      
      if (!data.success) {
        alert('فشل جلب الوظائف: ' + (data.error || 'خطأ غير معروف'));
        return;
      }
      
      if (!data.result || data.result.length === 0) {
        alert('لم يتم العثور على وظائف جديدة ليتم إضافتها.');
        return;
      }
      
      let added = 0;
      for (const job of data.result) {
        await addDoc(collection(db, 'jobs'), job);
        added++;
      }
      
      alert(`تم بنجاح جلب وإضافة ${added} وظيفة جديدة!`);
      fetchJobs();
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء الاتصال بالخادم لجلب الوظائف.');
    } finally {
      setIsScraping(false);
    }
  };

  const [siteSettings, setSiteSettings] = useState({
    siteName: 'فرص عمل سوريا',
    heroTitle: 'اكتشف فرصتك المهنية القادمة في سوريا',
    heroSubtitle: 'المنصة الرائدة لتجميع ونشر أحدث الوظائف الشاغرة من المنظمات والشركات'
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && ADMIN_EMAILS.includes(user.email || '')) {
        setIsAdmin(true);
        fetchJobs();
        fetchSettings();
      } else {
        setIsAdmin(false);
        setLoading(false);
        if (user) navigate('/'); // Redirect if not admin
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchSettings = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'general'));
      if (docSnap.exists()) {
        setSiteSettings(docSnap.data() as any);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSettings(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), siteSettings);
      alert('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('فشل حفظ الإعدادات');
    } finally {
      setSubmittingSettings(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(jobsData);
      
      const total = jobsData.length;
      const active = jobsData.filter((j: any) => j.status === 'active').length;
      const pending = jobsData.filter((j: any) => j.status === 'pending').length;
      setStats({ total, active, pending });
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) return;
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
      setJobs(jobs.filter(j => j.id !== jobId));
      alert('تم حذف الوظيفة بنجاح');
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('فشل حذف الوظيفة');
    }
  };

  const toggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'pending' : 'active';
    try {
      await updateDoc(doc(db, 'jobs', jobId), { status: newStatus });
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-20 px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">غير مصرح لك بالدخول</h1>
        <p className="text-gray-500 mb-8">يجب أن تكون مديراً للوصول إلى هذه الصفحة.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/login" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
            تسجيل الدخول
          </Link>
          <Link to="/" className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>لوحة التحكم | الإدارة</title>
      </Helmet>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">لوحة تحكم الإدارة</h1>
          <p className="text-gray-500 mt-1">إدارة الوظائف، المستخدمين، وإعدادات الموقع</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleScrapeJobs}
            disabled={isScraping}
            className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-200 transition-all shadow-sm disabled:opacity-50"
          >
            {isScraping ? (
              <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Search className="w-5 h-5" />
            )}
            جلب وظائف (Scrape)
          </button>
          <Link 
            to="/post-job" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            إضافة وظيفة جديدة
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-4 px-2 font-bold transition-all border-b-2 ${
            activeTab === 'jobs' 
            ? 'border-blue-600 text-blue-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          إدارة الوظائف
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-4 px-2 font-bold transition-all border-b-2 ${
            activeTab === 'settings' 
            ? 'border-blue-600 text-blue-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          إعدادات الموقع
        </button>
      </div>

      {activeTab === 'jobs' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-gray-500 text-sm">إجمالي الوظائف</div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.active}</div>
              <div className="text-gray-500 text-sm">وظائف نشطة</div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-gray-500 text-sm">في انتظار الموافقة</div>
            </div>
          </div>

          {/* Jobs Management Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900">إدارة الوظائف</h2>
              <div className="relative w-full md:w-72">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="بحث في الوظائف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">الوظيفة</th>
                    <th className="px-6 py-4 font-bold">الشركة</th>
                    <th className="px-6 py-4 font-bold">التاريخ</th>
                    <th className="px-6 py-4 font-bold">الحالة</th>
                    <th className="px-6 py-4 font-bold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{job.title}</div>
                        <div className="text-xs text-gray-500">{job.location}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{job.company}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {job.createdAt?.toDate ? job.createdAt.toDate().toLocaleDateString('ar-SY') : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleJobStatus(job.id, job.status)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                            job.status === 'active' 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                          }`}
                        >
                          {job.status === 'active' ? 'نشطة' : 'معلقة'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/job/${job.slug}`} 
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="عرض"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </Link>
                          <Link 
                            to={`/admin/edit-job/${job.id}`} 
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="تعديل"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredJobs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        لم يتم العثور على وظائف تطابق بحثك.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <LayoutIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">إعدادات الواجهة الرئيسية</h2>
                <p className="text-gray-500 text-sm">تحكم في النصوص المعروضة للزوار</p>
              </div>
            </div>

            <form onSubmit={handleUpdateSettings} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">اسم الموقع</label>
                <input
                  type="text"
                  value={siteSettings.siteName}
                  onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">عنوان قسم البطل (Hero Title)</label>
                <input
                  type="text"
                  value={siteSettings.heroTitle}
                  onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">النص الفرعي (Hero Subtitle)</label>
                <textarea
                  rows={3}
                  value={siteSettings.heroSubtitle}
                  onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingSettings}
                className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {submittingSettings ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    حفظ الإعدادات
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
