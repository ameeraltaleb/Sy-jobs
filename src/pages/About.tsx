import { Helmet } from 'react-helmet-async';
import { Briefcase, Users, Target, Heart } from 'lucide-react';

export default function About() {
  return (
    <>
      <Helmet>
        <title>من نحن | منصة فرص عمل سوريا</title>
        <meta name="description" content="تعرف على منصة فرص عمل سوريا، أكبر موقع توظيف يهدف إلى مساعدة الشباب السوري في العثور على وظائف شاغرة في دمشق، حلب، وباقي المحافظات." />
        <link rel="canonical" href="https://syriajobs.net/about" />
        <meta property="og:title" content="من نحن | منصة فرص عمل سوريا" />
        <meta property="og:description" content="تعرف على منصة فرص عمل سوريا، أكبر موقع توظيف يهدف إلى مساعدة الشباب السوري في العثور على فرص العمل المناسبة." />
        <meta property="og:url" content="https://syriajobs.net/about" />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-600 text-white mb-6 shadow-lg">
            <Briefcase className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            عن منصة فرص عمل سوريا
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            نحن المنصة الرائدة والأسرع نمواً في مجال التوظيف في سوريا. نهدف إلى سد الفجوة بين الكفاءات السورية الشابة والشركات والمنظمات الباحثة عن مواهب.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">رؤيتنا</h2>
            <p className="text-gray-600 leading-relaxed">
              أن نكون المرجع الأول والأكثر ثقة لكل باحث عن عمل في سوريا، سواء كان يبحث عن وظائف شاغرة في دمشق، حلب، حمص، أو يبحث عن فرص عمل عن بعد مع شركات إقليمية وعالمية.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
              <Heart className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">مهمتنا</h2>
            <p className="text-gray-600 leading-relaxed">
              تسهيل رحلة البحث عن عمل للشباب السوري من خلال تجميع وتصنيف آلاف الوظائف من مختلف القطاعات (الخاص، المنظمات الإنسانية، العمل الحر) وتقديمها بواجهة سهلة ومجانية بالكامل.
            </p>
          </div>
        </div>

        <div className="bg-blue-600 rounded-3xl p-8 md:p-12 text-white text-center shadow-xl">
          <Users className="w-12 h-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-2xl md:text-3xl font-bold mb-6">لماذا تختار منصة فرص عمل سوريا؟</h2>
          <div className="grid sm:grid-cols-3 gap-6 text-right">
            <div>
              <h3 className="font-bold text-xl mb-2 text-blue-100">تحديث يومي</h3>
              <p className="text-blue-50 text-sm leading-relaxed">نقوم بنشر أحدث الوظائف الشاغرة في سوريا يومياً من مصادر موثوقة.</p>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-2 text-blue-100">تغطية شاملة</h3>
              <p className="text-blue-50 text-sm leading-relaxed">نغطي كافة المحافظات السورية (دمشق، ريف دمشق، حلب، اللاذقية، طرطوس، وغيرها).</p>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-2 text-blue-100">مجانية دائماً</h3>
              <p className="text-blue-50 text-sm leading-relaxed">خدماتنا مجانية بالكامل للباحثين عن عمل، ولن نطلب منك أي رسوم مقابل التقديم.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
