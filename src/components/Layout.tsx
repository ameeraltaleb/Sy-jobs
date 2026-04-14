import { Link, Outlet, useLocation } from 'react-router-dom';
import { Briefcase, Search, Bell, Bookmark, Menu, X, Home, Grid, Bookmark as BookmarkIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'الرئيسية', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'التصنيفات', path: '/categories', icon: <Grid className="w-5 h-5" /> },
    { name: 'المحفوظات', path: '/saved', icon: <BookmarkIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="bg-blue-600 p-2 rounded-xl group-hover:bg-blue-700 transition-colors shadow-sm">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-extrabold text-gray-900 tracking-tight">فرص عمل سوريا</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    className={`font-bold transition-colors flex items-center gap-2 ${
                      isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <button className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <Link to="/post-job" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ml-2">
                نشر وظيفة
              </Link>
            </div>

            {/* Mobile menu button & icons */}
            <div className="flex items-center gap-1 md:hidden">
              <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 ml-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white absolute w-full shadow-xl">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                );
              })}
              <div className="pt-4 mt-2 border-t border-gray-100">
                <Link to="/post-job" className="flex items-center justify-center w-full bg-blue-600 text-white px-4 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md">
                  نشر وظيفة جديدة
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-6 group">
                <div className="bg-blue-600 p-2 rounded-xl group-hover:bg-blue-700 transition-colors">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-extrabold text-gray-900 tracking-tight">فرص عمل سوريا</span>
              </Link>
              <p className="text-gray-500 mb-6 max-w-md leading-relaxed text-lg">
                المنصة الأولى لتجميع ونشر فرص العمل في سوريا. نهدف إلى ربط الكفاءات السورية بأفضل الفرص المتاحة في السوق المحلي وعن بعد.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase mb-6">روابط سريعة</h3>
              <ul className="space-y-4">
                <li><Link to="/about" className="text-gray-500 hover:text-blue-600 font-medium transition-colors">من نحن</Link></li>
                <li><Link to="/contact" className="text-gray-500 hover:text-blue-600 font-medium transition-colors">اتصل بنا</Link></li>
                <li><Link to="/categories" className="text-gray-500 hover:text-blue-600 font-medium transition-colors">تصفح الوظائف</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase mb-6">قانوني</h3>
              <ul className="space-y-4">
                <li><Link to="/privacy" className="text-gray-500 hover:text-blue-600 font-medium transition-colors">سياسة الخصوصية</Link></li>
                <li><Link to="/terms" className="text-gray-500 hover:text-blue-600 font-medium transition-colors">شروط الاستخدام</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 font-medium">
              &copy; {new Date().getFullYear()} فرص عمل سوريا. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
