import { Helmet } from 'react-helmet-async';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PostJob() {
  return (
    <>
      <Helmet>
        <title>نشر وظيفة | فرص عمل سوريا</title>
        <meta name="description" content="خدمة نشر الوظائف ستكون متاحة قريباً." />
      </Helmet>

      <div className="max-w-2xl mx-auto mt-12 bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 text-blue-600 mb-6">
          <Clock className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">قريباً جداً!</h1>
        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
          خدمة نشر الوظائف غير مفعلة حالياً.
          <br />
          نعمل حالياً على تطوير وتحديث هذه الميزة لضمان تقديم أفضل تجربة ممكنة لأصحاب العمل.
          <br />
          <span className="font-medium text-gray-900 mt-4 block">سيتم إتاحة ميزة نشر الوظائف في المستقبل القريب.</span>
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          العودة للرئيسية
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </>
  );
}
