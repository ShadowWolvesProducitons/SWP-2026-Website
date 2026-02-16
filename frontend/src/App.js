import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Films from "./pages/Films";
import TheDen from "./pages/TheDen";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ProductPage from "./pages/ProductPage";
import WorkWithUs from "./pages/WorkWithUs";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import LeadMagnetPopup from "./components/LeadMagnetPopup";
import { Toaster } from "./components/ui/sonner";

// Studio Portal Pages
import RequestAccess from "./pages/RequestAccess";
import VerifyAccess from "./pages/VerifyAccess";
import StudioLogin from "./pages/StudioLogin";
import StudioPortalLayout from "./pages/StudioPortalLayout";
import StudioDashboard from "./pages/StudioDashboard";
import StudioProjects from "./pages/StudioProjects";
import StudioProjectDetail from "./pages/StudioProjectDetail";
import StudioUpdates from "./pages/StudioUpdates";
import StudioAssets from "./pages/StudioAssets";
import StudioAccount from "./pages/StudioAccount";

const Layout = ({ children, showLayout, showPopup }) => {
  if (!showLayout) return <>{children}</>;
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      {showPopup && <LeadMagnetPopup />}
    </>
  );
};

const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) return <Navigate to="/admin" replace />;
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    () => sessionStorage.getItem('adminAuth') === 'true'
  );
  
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStudioAccessRoute = location.pathname.startsWith('/studio-access');
  const isRequestAccessRoute = location.pathname === '/request-access';
  const isVerifyAccessRoute = location.pathname === '/verify-access';
  const isResetPasswordRoute = location.pathname === '/reset-password';
  
  // Show header/footer for public pages
  const showLayout = !isAdminRoute && !isStudioAccessRoute && !isRequestAccessRoute && !isVerifyAccessRoute && !isResetPasswordRoute;
  const showPopup = !isAdminRoute && !isStudioAccessRoute && !isRequestAccessRoute && !isVerifyAccessRoute && !isResetPasswordRoute;

  return (
    <Layout showLayout={showLayout} showPopup={showPopup}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<Navigate to="/" replace />} />
        
        {/* Films - Route-based modal: /films and /films/:slug both render Films component */}
        <Route path="/films" element={<Films />} />
        <Route path="/films/:slug" element={<Films />} />
        
        {/* Redirect /contact to /work-with-us */}
        <Route path="/contact" element={<Navigate to="/work-with-us" replace />} />
        
        {/* Request Access Flow (Public) */}
        <Route path="/request-access" element={<RequestAccess />} />
        <Route path="/verify-access" element={<VerifyAccess />} />
        <Route path="/reset-password" element={<VerifyAccess />} />
        
        {/* Studio Portal */}
        <Route path="/studio-access/login" element={<StudioLogin />} />
        <Route path="/studio-access" element={<StudioPortalLayout />}>
          <Route index element={<StudioDashboard />} />
          <Route path="projects" element={<StudioProjects />} />
          <Route path="projects/:slug" element={<StudioProjectDetail />} />
          <Route path="updates" element={<StudioUpdates />} />
          <Route path="assets" element={<StudioAssets />} />
          <Route path="account" element={<StudioAccount />} />
        </Route>
        
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/work-with-us" element={<WorkWithUs />} />
        
        {/* The Armory */}
        <Route path="/armory" element={<TheDen />} />
        <Route path="/armory/:slug" element={<ProductPage />} />
        
        {/* Legacy redirects */}
        <Route path="/services" element={<Navigate to="/armory" replace />} />
        <Route path="/den" element={<Navigate to="/armory" replace />} />
        
        {/* Redirect old investor routes to request-access */}
        <Route path="/investors" element={<Navigate to="/request-access" replace />} />
        <Route path="/investors/*" element={<Navigate to="/request-access" replace />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          isAdminAuthenticated ?
            <Navigate to="/admin/dashboard" replace /> :
            <AdminLogin onLogin={() => setIsAdminAuthenticated(true)} />
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute isAuthenticated={isAdminAuthenticated}>
            <AdminDashboard onLogout={() => setIsAdminAuthenticated(false)} />
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster />
    </Layout>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </div>
  );
}

export default App;
