import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Code, PenTool, Megaphone, Briefcase, Stethoscope, Calculator, Wrench, GraduationCap, Globe, FileText } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export const CATEGORIES_DATA = [
  { id: 'programming', name: 'برمجة وتطوير', icon: Code, keywords: ['برمج', 'مطور', 'software', 'developer', 'it', 'تقني', 'ويب', 'تطبيق'] },
  { id: 'design', name: 'تصميم جرافيك', icon: PenTool, keywords: ['تصميم', 'جرافيك', 'مصمم', 'designer', 'graphic', 'ui', 'ux'] },
  { id: 'marketing', name: 'تسويق ومبيعات', icon: Megaphone, keywords: ['تسويق', 'مبيعات', 'ماركتنج', 'marketing', 'sales', 'مندوب'] },
  { id: 'management', name: 'إدارة أعمال', icon: Briefcase, keywords: ['إدارة', 'مدير', 'أعمال', 'management', 'manager', 'منسق', 'coordinator'] },
  { id: 'medical', name: 'طب وصحة', icon: Stethoscope, keywords: ['طب', 'صحة', 'طبيب', 'ممرض', 'صيدلي', 'medical', 'health', 'doctor', 'nurse'] },
  { id: 'accounting', name: 'محاسبة ومالية', icon: Calculator, keywords: ['محاسب', 'مالي', 'accounting', 'finance', 'accountant'] },
  { id: 'engineering', name: 'هندسة', icon: Wrench, keywords: ['مهندس', 'هندس', 'engineer', 'engineering'] },
  { id: 'education', name: 'تعليم وتدريب', icon: GraduationCap, keywords: ['تعليم', 'تدريب', 'مدرس', 'معلم', 'education', 'teacher', 'trainer'] },
  { id: 'ngo', name: 'منظمات إنسانية', icon: Globe, keywords: ['منظمة', 'ngo', 'إنساني', 'إغاثة', 'un', 'undp', 'unicef', 'ميداني'] },
  { id: 'writing', name: 'كتابة وترجمة', icon: FileText, keywords: ['كتابة', 'ترجمة', 'مترجم', 'كاتب', 'محتوى', 'translator', 'writer', 'content'] },
];

export default function Categories() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAndCountJobs() {
      try {
        const querySnapshot = await getDocs(collection(db, 'jobs'));
        const jobs = querySnapshot.docs.map(doc => doc.data());
        
        const newCounts: Record<string, number> = {};
        
        // Initialize counts to 0
        CATEGORIES_DATA.forEach(cat => {
          newCounts[cat.id] = 0;
        });

        // Count jobs for each category based on keywords
        jobs.forEach(job => {
          const searchableText = `${job.title || ''} ${job.description || ''} ${(job.tags || []).join(' ')}`.toLowerCase();
          
          CATEGORIES_DATA.forEach(category => {
            const matches = category.keywords.some(keyword => searchableText.includes(keyword.toLowerCase()));
            if (matches) {
              newCounts[category.id]++;
            }
          });
        });

        setCounts(newCounts);
      } catch (error) {
        console.error("Error fetching jobs for categories:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAndCountJobs();
  }, []);

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
          {CATEGORIES_DATA.map((category) => {
            const Icon = category.icon;
            const count = counts[category.id] || 0;
            
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
                <p className="text-gray-500 text-sm">
                  {loading ? (
                    <span className="inline-block w-8 h-4 bg-gray-200 animate-pulse rounded"></span>
                  ) : (
                    <>{count}</>
                  )} وظيفة متاحة
                </p>
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
