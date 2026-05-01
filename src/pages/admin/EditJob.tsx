import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Save, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const ADMIN_EMAILS = ['ameeraltaleb@gmail.com'];

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    category: 'Other',
    description: '',
    requirements: '',
    applicationUrl: '',
    salary: '',
    experience: '',
    deadline: '',
    status: 'active'
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && ADMIN_EMAILS.includes(user.email || '')) {
        setIsAdmin(true);
        if (id) fetchJob(id);
      } else {
        setIsAdmin(false);
        setLoading(false);
        if (user) navigate('/');
      }
    });

    return () => unsubscribe();
  }, [id, navigate]);

  const fetchJob = async (jobId: string) => {
    try {
      const docSnap = await getDoc(doc(db, 'jobs', jobId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          title: data.title || '',
          company: data.company || '',
          location: data.location || '',
          type: data.type || 'Full-time',
          category: data.category || 'Other',
          description: data.description || '',
          requirements: Array.isArray(data.requirements) ? data.requirements.join('\n') : (data.requirements || ''),
          applicationUrl: data.applicationUrl || '',
          salary: data.salary || '',
          experience: data.experience || '',
          deadline: data.deadline || '',
          status: data.status || 'active'
        });
      } else {
        setError('الوظيفة غير موجودة');
      }
    } catch (err) {
      console.error(err);
      setError('فشل في تحميل بيانات الوظيفة');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedData = {
        ...formData,
        requirements: formData.requirements.split('\n').filter(r => r.trim() !== ''),
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, 'jobs', id), updatedData);
      setSuccess(true);
      setTimeout(() => navigate('/admin'), 2000);
    } catch (err) {
      console.error(err);
      setError('فشل تعديل الوظيفة. يرجى التأكد من الصلاحيات.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Helmet>
        <title>تعديل وظيفة | لوحة التحكم</title>
      </Helmet>

      <button 
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 transition-colors font-bold"
      >
        <ArrowRight className="w-5 h-5" />
        العودة للوحة التحكم
      </button>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">تعديل بيانات الوظيفة</h1>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-8 p-4 bg-green-50 border border-green-100 text-green-600 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <p>تم تحديث الوظيفة بنجاح! سيتم توجيهك للوحة التحكم...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">عنوان الوظيفة</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الشركة</label>
              <input
                type="text"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الموقع</label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">نوع العمل</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Full-time">دوام كامل</option>
                <option value="Part-time">دوام جزئي</option>
                <option value="Contract">عقد</option>
                <option value="Remote">عن بعد</option>
                <option value="Internship">تدريب</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الحالة</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">نشطة</option>
                <option value="pending">معلقة</option>
                <option value="closed">مغلقة</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">الوصف</label>
            <textarea
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">المتطلبات (كل متطلب في سطر منفصل)</label>
            <textarea
              name="requirements"
              rows={5}
              value={formData.requirements}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">رابط التقديم / البريد الإلكتروني</label>
              <input
                type="text"
                name="applicationUrl"
                value={formData.applicationUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الموعد النهائي</label>
              <input
                type="text"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                placeholder="مثال: 30 أيار 2024"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                حفظ التعديلات
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
