/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Lazy load pages for better performance (Code Splitting)
const Home = lazy(() => import('./pages/Home'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Contact = lazy(() => import('./pages/Contact'));
const Categories = lazy(() => import('./pages/Categories'));
const Saved = lazy(() => import('./pages/Saved'));
const PostJob = lazy(() => import('./pages/PostJob'));

// A simple loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="job/:slug" element={<JobDetails />} />
          <Route path="categories" element={<Categories />} />
          <Route path="saved" element={<Saved />} />
          <Route path="about" element={<About />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="contact" element={<Contact />} />
          <Route path="post-job" element={<PostJob />} />
        </Route>
      </Routes>
    </Suspense>
  );
}



