import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { CMSProvider } from '@/lib/cms-context';
import Navbar from '@/components/shared/navbar';
import Footer from '@/components/shared/footer';
import SEOHead from '@/components/shared/seo-head';
import LoadingScreen from '@/components/shared/loading-screen';
import ErrorBoundary from '@/components/shared/error-boundary';
import OfflinePage from '@/pages/offline-page';
import FloatingActions from '@/components/communication/floating-actions';
import MobileBottomNav from '@/components/communication/mobile-bottom-nav';
import AdmissionPopup from '@/components/popup/admission-popup';
import AnnouncementPopup from '@/components/popup/announcement-popup';
import CollegeChatbot from '@/components/chatbot/college-chatbot';
import { SkeletonAdmissionForm, SkeletonFeeTable, SkeletonHero, SkeletonSection } from '@/components/shared/skeletons';

const HomePage = lazy(() => import('@/pages/home-page'));
const AboutPage = lazy(() => import('@/pages/about-page'));
const CoursesPage = lazy(() => import('@/pages/courses-page'));
const AchievementsPage = lazy(() => import('@/pages/achievements-page'));
const GalleryPage = lazy(() => import('@/pages/gallery-page'));
const FeeStructurePage = lazy(() => import('@/pages/fee-structure-page'));
const TransportPage = lazy(() => import('@/pages/transport-page'));
const AdmissionPage = lazy(() => import('@/pages/admission-page'));
const AdmissionSuccessPage = lazy(() => import('@/pages/admission-success-page'));
const ContactPage = lazy(() => import('@/pages/contact-page'));
const CareersPage = lazy(() => import('@/pages/careers-page'));
const CareerJobPage = lazy(() => import('@/pages/career-job-page'));
const AnnouncementsPage = lazy(() => import('@/pages/announcements-page'));
const AnnouncementDetailPage = lazy(() => import('@/pages/announcement-detail-page'));
const NotFoundPage = lazy(() => import('@/pages/not-found-page'));
const AdminLoginPage = lazy(() => import('@/pages/admin/login-page'));
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/analytics-dashboard'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/dashboard'));
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'));
const AdminRoute = lazy(() => import('@/components/admin/AdminRoute'));
const AdminAdmissionsPage = lazy(() => import('@/pages/admin/admissions'));
const AdminEnquiriesPage = lazy(() => import('@/pages/admin/enquiries'));
const AdminAnnouncementsPage = lazy(() => import('@/pages/admin/announcements'));
const AdminSiteConfigPage = lazy(() => import('@/pages/admin/cms/site-config'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/settings'));
const AdminCareersPage = lazy(() => import('@/pages/admin/careers'));
const AdminCareerApplicationsPage = lazy(() => import('@/pages/admin/career-applications'));
const AdminUsersPage = lazy(() => import('@/pages/admin/admin-users'));
const AdminMediaLibraryPage = lazy(() => import('@/pages/admin/media-library'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PageSkeleton({ page }: { page: string }) {
  if (page === 'hero') return <SkeletonHero />;
  if (page === 'admission') return <SkeletonAdmissionForm />;
  if (page === 'fee') return <SkeletonFeeTable />;
  return <SkeletonSection />;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <ErrorBoundary>
      <CMSProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </CMSProvider>
    </ErrorBoundary>
  );
}

function AppShell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      <SEOHead />
      {!isAdmin && <Navbar />}
      {!isAdmin && <OfflinePage />}
      <main>
        <Suspense fallback={<PageSkeleton page="section" />}>
          <Routes>
            <Route path="/" element={<Suspense fallback={<PageSkeleton page="hero" />}><HomePage /></Suspense>} />
            <Route path="/about" element={<Suspense fallback={<PageSkeleton page="section" />}><AboutPage /></Suspense>} />
            <Route path="/courses" element={<Suspense fallback={<PageSkeleton page="section" />}><CoursesPage /></Suspense>} />
            <Route path="/achievements" element={<Suspense fallback={<PageSkeleton page="section" />}><AchievementsPage /></Suspense>} />
            <Route path="/gallery" element={<Suspense fallback={<PageSkeleton page="section" />}><GalleryPage /></Suspense>} />
            <Route path="/fee-structure" element={<Suspense fallback={<PageSkeleton page="fee" />}><FeeStructurePage /></Suspense>} />
            <Route path="/transport" element={<Suspense fallback={<PageSkeleton page="section" />}><TransportPage /></Suspense>} />
            <Route path="/admission" element={<Suspense fallback={<PageSkeleton page="admission" />}><AdmissionPage /></Suspense>} />
            {/* Alias: visitors and older links use the plural form. Redirect (not duplicate)
                so the canonical /admission URL stays the single indexable page. */}
            <Route path="/admissions" element={<Navigate to="/admission" replace />} />
            <Route path="/admission-success" element={<Suspense fallback={<PageSkeleton page="section" />}><AdmissionSuccessPage /></Suspense>} />
            <Route path="/contact" element={<Suspense fallback={<PageSkeleton page="section" />}><ContactPage /></Suspense>} />
            <Route path="/careers" element={<Suspense fallback={<PageSkeleton page="section" />}><CareersPage /></Suspense>} />
            <Route path="/careers/:slug" element={<Suspense fallback={<PageSkeleton page="section" />}><CareerJobPage /></Suspense>} />
            <Route path="/announcements" element={<Suspense fallback={<PageSkeleton page="section" />}><AnnouncementsPage /></Suspense>} />
            <Route path="/announcements/:id" element={<Suspense fallback={<PageSkeleton page="section" />}><AnnouncementDetailPage /></Suspense>} />
            <Route path="/admin/login" element={<Suspense fallback={<PageSkeleton page="section" />}><AdminLoginPage /></Suspense>} />

            <Route element={<Suspense><AdminRoute /></Suspense>}>
              <Route path="/admin" element={<Suspense fallback={<div>Loading admin...</div>}><AdminLayout /></Suspense>}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Suspense fallback={<div>Loading...</div>}><AdminDashboardPage /></Suspense>} />
                <Route path="announcements" element={<Suspense fallback={<div>Loading...</div>}><AdminAnnouncementsPage /></Suspense>} />
                <Route path="analytics" element={<Suspense fallback={<div>Loading...</div>}><AdminAnalyticsPage /></Suspense>} />
                <Route path="admissions" element={<Suspense fallback={<div>Loading...</div>}><AdminAdmissionsPage /></Suspense>} />
                <Route path="enquiries" element={<Suspense fallback={<div>Loading...</div>}><AdminEnquiriesPage /></Suspense>} />
                <Route path="careers" element={<Suspense fallback={<div>Loading...</div>}><AdminCareersPage /></Suspense>} />
                <Route path="careers/applications" element={<Suspense fallback={<div>Loading...</div>}><AdminCareerApplicationsPage /></Suspense>} />
                <Route path="cms" element={<Navigate to="/admin/cms/site-config" replace />} />
                <Route path="cms/site-config" element={<Suspense fallback={<div>Loading...</div>}><AdminSiteConfigPage /></Suspense>} />
                <Route path="media-library" element={<Suspense fallback={<div>Loading...</div>}><AdminMediaLibraryPage /></Suspense>} />
                <Route path="admin-users" element={<Suspense fallback={<div>Loading...</div>}><AdminUsersPage /></Suspense>} />
                <Route path="settings" element={<Suspense fallback={<div>Loading...</div>}><AdminSettingsPage /></Suspense>} />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <FloatingActions />}
      {!isAdmin && <CollegeChatbot />}
      {!isAdmin && <MobileBottomNav />}
      {!isAdmin && <AdmissionPopup />}
      {!isAdmin && <AnnouncementPopup />}
    </>
  );
}
