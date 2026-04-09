/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import JobDetails from './pages/JobDetails';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import Categories from './pages/Categories';
import Saved from './pages/Saved';
import PostJob from './pages/PostJob';

export default function App() {
  return (
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
  );
}



