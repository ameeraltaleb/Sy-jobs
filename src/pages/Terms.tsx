import { Helmet } from 'react-helmet-async';

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>شروط الاستخدام | فرص عمل سوريا</title>
        <meta name="description" content="شروط وأحكام استخدام منصة فرص عمل سوريا." />
      </Helmet>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">شروط الاستخدام</h1>
        <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
          <p>
            مرحباً بك في موقع <strong>فرص عمل سوريا</strong>. باستخدامك لهذا الموقع، فإنك توافق على الالتزام بالشروط والأحكام التالية:
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. طبيعة الخدمة</h2>
          <p>
            الموقع هو محرك بحث ومجمع لفرص العمل المتاحة على الإنترنت. نحن لا نمثل الشركات المعلنة ولا نتدخل في عملية التوظيف أو الاختيار.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. إخلاء المسؤولية</h2>
          <p>
            نحن نبذل قصارى جهدنا للتحقق من صحة الوظائف المنشورة، ولكننا لا نتحمل أي مسؤولية قانونية عن صحة الإعلانات أو مصداقية الشركات. يجب على الباحث عن عمل توخي الحذر وعدم دفع أي مبالغ مالية لأي جهة تطلب رسوماً مقابل التوظيف.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. حقوق الملكية الفكرية</h2>
          <p>
            جميع المحتويات الأصلية والتصميم والشعارات الموجودة في الموقع هي ملك لمنصة "فرص عمل سوريا". لا يجوز نسخ أو إعادة إنتاج أي جزء من الموقع بدون إذن كتابي.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. الاستخدام المقبول</h2>
          <p>
            يُمنع استخدام الموقع لأي أغراض غير قانونية أو ضارة، بما في ذلك محاولة اختراق النظام أو إرسال رسائل مزعجة (Spam).
          </p>
        </div>
      </div>
    </>
  );
}
