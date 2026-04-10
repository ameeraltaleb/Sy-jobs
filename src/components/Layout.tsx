import { Link, Outlet } from 'react-router-dom';
import { Briefcase, Search, Bell, Bookmark, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <Briefcase className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">فرص عمل سوريا</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">الرئيسية</Link>
              <Link to="/categories" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">التصنيفات</Link>
              <Link to="/saved" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">المحفوظات</Link>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <Link to="/post-job" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                نشر وظيفة
              </Link>
            </div>

            {/* Mobile menu button & icons */}
            <div className="flex items-center gap-2 md:hidden">
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md">الرئيسية</Link>
              <Link to="/categories" className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-md">التصنيفات</Link>
              <Link to="/saved" className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-md">المحفوظات</Link>
              <Link to="/post-job" className="block px-3 py-2 text-base font-medium text-blue-600 hover:bg-gray-50 rounded-md">نشر وظيفة</Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <Briefcase className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">فرص عمل سوريا</span>
              </Link>
              <p className="text-gray-500 mb-4 max-w-md">
                المنصة الأولى لتجميع ونشر فرص العمل في سوريا. نهدف إلى ربط الكفاءات السورية بأفضل الفرص المتاحة في السوق المحلي وعن بعد.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">روابط سريعة</h3>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-gray-500 hover:text-blue-600 transition-colors">من نحن</Link></li>
                <li><Link to="/contact" className="text-gray-500 hover:text-blue-600 transition-colors">اتصل بنا</Link></li>
                <li><Link to="/categories" className="text-gray-500 hover:text-blue-600 transition-colors">تصفح الوظائف</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">قانوني</h3>
              <ul className="space-y-3">
                <li><Link to="/privacy" className="text-gray-500 hover:text-blue-600 transition-colors">سياسة الخصوصية</Link></li>
                <li><Link to="/terms" className="text-gray-500 hover:text-blue-600 transition-colors">شروط الاستخدام</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} فرص عمل سوريا. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
