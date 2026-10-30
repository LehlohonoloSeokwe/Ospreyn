/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OverviewPage } from './pages/OverviewPage';
import { IndicatorDetailPage } from './pages/IndicatorDetailPage';
import { ComparePage } from './pages/ComparePage';
import { SectorsPage } from './pages/SectorsPage';
import { CalendarPage } from './pages/CalendarPage';
import { BriefsPage } from './pages/BriefsPage';
import { AboutPage } from './pages/AboutPage';
import { VerifyRegistryPage } from './pages/VerifyRegistryPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/indicators" element={<IndicatorDetailPage />} />
            <Route path="/indicators/:indicatorId" element={<IndicatorDetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/sectors" element={<SectorsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/briefs" element={<BriefsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/verify" element={<VerifyRegistryPage />} />
            {/* Catch-all route returns to Overview */}
            <Route path="*" element={<OverviewPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
