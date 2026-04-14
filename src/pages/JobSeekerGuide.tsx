import { Helmet } from 'react-helmet-async';
import { BookOpen, Target, Briefcase, Globe, CheckCircle2 } from 'lucide-react';

export default function JobSeekerGuide() {
  return (
    <>
      <Helmet>
        <title>دليل الباحث عن عمل في سوريا | نصائح للقبول في وظائف المنظمات والشركات</title>
        <meta name="description" content="دليل شامل للباحثين عن فرص عمل في سوريا. تعلم كيفية كتابة سيرة ذاتية احترافية، اجتياز مقابلات العمل، والتقديم على وظائف المنظمات الإنسانية والعمل عن بعد." />
        <link rel="canonical" href="https://syriajobs.net/guide" />
        <meta property="og:title" content="دليل الباحث عن عمل في سوريا | نصائح للقبول في الوظائف" />
        <meta property="og:description" content="دليل شامل للباحثين عن فرص عمل في سوريا. تعلم كيفية كتابة سيرة ذاتية احترافية، اجتياز مقابلات العمل، والتقديم على وظائف المنظمات الإنسانية." />
        <meta property="og:url" content="https://syriajobs.net/guide" />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            دليل الباحث عن عمل في سوريا
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            جمعنا لك أهم النصائح والاستراتيجيات لزيادة فرص قبولك في الوظائف الشاغرة في دمشق، حلب، وباقي المحافظات السورية، بالإضافة إلى وظائف المنظمات والعمل عن بعد.
          </p>
        </div>

        <div className="space-y-12">
          {/* Section 1: NGOs */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                <Globe className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">كيفية التقديم على وظائف المنظمات في سوريا</h2>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              تعتبر وظائف المنظمات الإنسانية والدولية (NGOs) مثل الأمم المتحدة، الهلال الأحمر، والمنظمات المحلية من أكثر الوظائف طلباً في سوريا نظراً لبيئة العمل الاحترافية والرواتب المجزية. للنجاح في التقديم:
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700"><strong>تخصيص السيرة الذاتية:</strong> المنظمات تبحث عن كلمات مفتاحية معينة (مثل: المراقبة والتقييم MERL، الدعم النفسي الاجتماعي PSS، إدارة الحالة). تأكد من تضمينها إذا كانت لديك الخبرة.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700"><strong>رسالة التغطية (Cover Letter):</strong> لا ترسل سيرتك الذاتية بدون رسالة تغطية تشرح فيها لماذا أنت مهتم برسالة المنظمة وكيف ستضيف قيمة لهم.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700"><strong>التطوع أولاً:</strong> إذا لم تكن لديك خبرة سابقة، فإن التطوع مع مبادرات محلية أو الهلال الأحمر السوري يفتح لك أبواباً واسعة للتوظيف لاحقاً.</span>
              </li>
            </ul>
          </section>

          {/* Section 2: Remote Work */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                <Briefcase className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">العمل عن بعد (Remote Work) من سوريا</h2>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              مع تطور التكنولوجيا، أصبح العمل عن بعد خياراً ممتازاً للشباب السوري، خاصة في مجالات البرمجة، التصميم الجرافيكي، كتابة المحتوى، وإدارة حسابات التواصل الاجتماعي.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700"><strong>بناء معرض أعمال (Portfolio):</strong> الشركات الأجنبية أو الخليجية لا تهتم بشهادتك بقدر اهتمامها بما يمكنك فعله. قم ببناء معرض أعمال قوي على منصات مثل Behance أو GitHub.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700"><strong>اللغة الإنجليزية:</strong> هي المفتاح الأساسي للحصول على فرص عمل عن بعد برواتب ممتازة. استثمر وقتك في تطوير لغتك.</span>
              </li>
            </ul>
          </section>

          {/* Section 3: CV Tips */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-teal-50 p-3 rounded-xl text-teal-600">
                <BookOpen className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">نصائح لكتابة سيرة ذاتية (CV) احترافية</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-500" />
                  أخطاء شائعة تجنبها
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• استخدام قوالب مزخرفة ومليئة بالألوان (استخدم قوالب ATS-Friendly).</li>
                  <li>• وضع صورة شخصية غير احترافية.</li>
                  <li>• كتابة تفاصيل شخصية غير ضرورية (الحالة الاجتماعية، عدد الأولاد).</li>
                  <li>• إرسال السيرة الذاتية بصيغة Word بدلاً من PDF.</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  أشياء يجب إضافتها
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• ملخص مهني قوي في بداية الـ CV.</li>
                  <li>• ترتيب الخبرات من الأحدث إلى الأقدم.</li>
                  <li>• التركيز على الإنجازات (مثال: زدت المبيعات بنسبة 20%) وليس فقط المهام.</li>
                  <li>• إضافة رابط حسابك على LinkedIn.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* SEO Keywords Paragraph (Hidden but readable) */}
          <div className="text-xs text-gray-400 text-center mt-12 leading-relaxed">
            يبحث الكثير من الشباب عن: وظائف شاغرة في سوريا 2024، فرص عمل في دمشق اليوم، مطلوب موظفين في حلب، وظائف منظمات في سوريا، عمل عن بعد للطلاب في سوريا، وظائف شاغرة للبنات في دمشق، وظائف اللاذقية وحمص. نحن في منصة فرص عمل سوريا نسعى لتوفير أحدث الإعلانات الوظيفية لتلبية هذه الاحتياجات.
          </div>
        </div>
      </div>
    </>
  );
}
