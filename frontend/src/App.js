import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Films from "./pages/Films";
import FilmProject from "./pages/FilmProject";
import StudioAccess from "./pages/StudioAccess";
import TheDen from "./pages/TheDen";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ProductPage from "./pages/ProductPage";
import WorkWithUs from "./pages/WorkWithUs";
import InvestorsPublic from "./pages/InvestorsPublic";
import InvestorSignup from "./pages/InvestorSignup";
import InvestorLogin from "./pages/InvestorLogin";
import InvestorPortal from "./pages/InvestorPortal";
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
  const [isInvestorAuthenticated, setIsInvestorAuthenticated] = useState(
    () => sessionStorage.getItem('investorAuth') === 'true'
  );
  
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isInvestorPortalRoute = location.pathname === '/investors/portal' || location.pathname === '/investors/login';
  const isInvestorAuthRoute = location.pathname === '/investors/signup' || location.pathname === '/investors/login';
  const isStudioAccessRoute = location.pathname.startsWith('/studio-access');
  const isRequestAccessRoute = location.pathname === '/request-access';
  const isVerifyAccessRoute = location.pathname === '/verify-access';
  const isResetPasswordRoute = location.pathname === '/reset-password';
  
  // Show header/footer for public pages + public investors page + signup
  const showLayout = !isAdminRoute && !isInvestorPortalRoute && !isStudioAccessRoute && !isRequestAccessRoute && !isVerifyAccessRoute && !isResetPasswordRoute;
  const showPopup = !isAdminRoute && !isInvestorPortalRoute && !isInvestorAuthRoute && !isStudioAccessRoute && !isRequestAccessRoute && !isVerifyAccessRoute && !isResetPasswordRoute;

  return (
    <Layout showLayout={showLayout} showPopup={showPopup}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<Navigate to="/" replace />} />
        <Route path="/films" element={<Films />} />
        <Route path="/films/:slug" element={<FilmProject />} />
        <Route path="/studio-access/:slug" element={<StudioAccess />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/work-with-us" element={<WorkWithUs />} />
        
        {/* The Armory */}
        <Route path="/armory" element={<TheDen />} />
        <Route path="/armory/:slug" element={<ProductPage />} />
        
        {/* Legacy redirects */}
        <Route path="/services" element={<Navigate to="/armory" replace />} />
        <Route path="/den" element={<Navigate to="/armory" replace />} />
        
        {/* Investors — Public Marketing Page */}
        <Route path="/investors" element={<InvestorsPublic />} />
        
        {/* Investor Signup (with invite token — path-based) */}
        <Route path="/investors/signup/:token" element={<InvestorSignup />} />
        <Route path="/investors/signup" element={<InvestorSignup />} />
        
        {/* Investor Login */}
        <Route path="/investors/login" element={
          isInvestorAuthenticated ?
            <Navigate to="/investors/portal" replace /> :
            <InvestorLogin onLogin={() => setIsInvestorAuthenticated(true)} />
        } />
        
        {/* Investor Portal (gated) */}
        <Route path="/investors/portal" element={
          isInvestorAuthenticated ?
            <InvestorPortal onLogout={() => { setIsInvestorAuthenticated(false); sessionStorage.removeItem('investorAuth'); }} /> :
            <Navigate to="/investors/login" replace />
        } />
        
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
