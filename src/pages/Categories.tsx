import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Code, PenTool, Megaphone, Briefcase, Stethoscope, Calculator, Wrench, GraduationCap } from 'lucide-react';

const categories = [
  { id: 'programming', name: 'برمجة وتطوير', icon: Code, count: 120 },
  { id: 'design', name: 'تصميم جرافيك', icon: PenTool, count: 85 },
  { id: 'marketing', name: 'تسويق ومبيعات', icon: Megaphone, count: 150 },
  { id: 'management', name: 'إدارة أعمال', icon: Briefcase, count: 60 },
  { id: 'medical', name: 'طب وصحة', icon: Stethoscope, count: 45 },
  { id: 'accounting', name: 'محاسبة ومالية', icon: Calculator, count: 70 },
  { id: 'engineering', name: 'هندسة', icon: Wrench, count: 95 },
  { id: 'education', name: 'تعليم وتدريب', icon: GraduationCap, count: 110 },
];

export default function Categories() {
  return (
    <>
      <Helmet>
        <title>تصنيفات الوظائف | فرص عمل سوريا</title>
        <meta name="description" content="تصفح الوظائف الشاغرة في سوريا حسب المجال والتصنيف." />
      </Helmet>
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">تصفح الوظائف حسب المجال</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            اختر المجال الذي يتناسب مع مهاراتك وخبراتك لتجد الفرصة الأنسب لك.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                to={`/?category=${category.id}`}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-500 text-sm">{category.count} وظيفة متاحة</p>
              </Link>
            );
          })}
        </div>

        {/* AdSense Placeholder */}
        <div className="w-full h-32 bg-gray-200 rounded-xl mt-12 flex items-center justify-center text-gray-400 border border-gray-300 border-dashed">
          <span>مساحة إعلانية (AdSense)</span>
        </div>
      </div>
    </>
  );
}
