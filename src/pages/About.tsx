import { Helmet } from 'react-helmet-async';

export default function About() {
  return (
    <>
      <Helmet>
        <title>من نحن | فرص عمل سوريا</title>
        <meta name="description" content="تعرف على منصة فرص عمل سوريا، المنصة الرائدة في تجميع ونشر الوظائف الشاغرة في السوق السوري." />
      </Helmet>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">من نحن</h1>
        <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
          <p>
            مرحباً بك في <strong>فرص عمل سوريا</strong>، المنصة الأولى المتخصصة في تجميع ونشر أحدث الوظائف الشاغرة في السوق السوري.
          </p>
          <p>
            تأسست المنصة بهدف سد الفجوة بين الكفاءات السورية والشركات الباحثة عن مواهب، من خلال توفير محرك بحث ذكي وسهل الاستخدام يجمع الفرص الوظيفية من مختلف المصادر الموثوقة.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">رؤيتنا</h2>
          <p>
            أن نكون الوجهة الأولى والموثوقة لكل باحث عن عمل في سوريا، والمساهمة في الحد من البطالة وتطوير سوق العمل المحلي.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">ماذا نقدم؟</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>تحديث يومي للوظائف الشاغرة في مختلف المحافظات السورية.</li>
            <li>تغطية شاملة للعمل عن بعد (Remote Work) لتوفير فرص عالمية.</li>
            <li>واجهة مستخدم بسيطة وسريعة تتناسب مع سرعات الإنترنت المحلية.</li>
            <li>تصنيف دقيق للوظائف حسب المجال والمدينة.</li>
          </ul>
        </div>
      </div>
    </>
  );
}
