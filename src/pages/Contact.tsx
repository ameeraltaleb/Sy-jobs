import { Helmet } from 'react-helmet-async';
import { Globe, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'حدث خطأ غير متوقع');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.');
    }
  };

  return (
    <>
      <Helmet>
        <title>اتصل بنا | فرص عمل سوريا</title>
        <meta name="description" content="تواصل مع فريق فرص عمل سوريا لأي استفسارات أو اقتراحات." />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">اتصل بنا</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">أرسل لنا رسالة</h2>
            
            {status === 'success' && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.
              </div>
            )}
            
            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                {errorMessage}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">موضوع الرسالة</label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الرسالة</label>
                <textarea 
                  rows={4} 
                  required
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-70"
              >
                {status === 'loading' ? 'جاري الإرسال...' : 'إرسال الرسالة'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">معلومات التواصل</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">الموقع الإلكتروني</h3>
                    <p className="text-gray-600 mt-1">syrian-jobs.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">الموقع</h3>
                    <p className="text-gray-600 mt-1">دمشق، سوريا</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AdSense Placeholder */}
            <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 border border-gray-300 border-dashed">
              <span>مساحة إعلانية (AdSense)</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
