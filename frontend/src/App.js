import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Films from "./pages/Films";
import Services from "./pages/Services";
import TheDen from "./pages/TheDen";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ProductPage from "./pages/ProductPage";
import WorkWithUs from "./pages/WorkWithUs";
import InvestorLogin from "./pages/InvestorLogin";
import InvestorPortal from "./pages/InvestorPortal";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import LeadMagnetPopup from "./components/LeadMagnetPopup";
import { Toaster } from "./components/ui/sonner";

// Layout wrapper that conditionally renders Header/Footer
const Layout = ({ children, showLayout, showPopup }) => {
  if (!showLayout) {
    return <>{children}</>;
  }
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      {showPopup && <LeadMagnetPopup />}
    </>
  );
};

// Protected route component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

// Main App content (needs to be inside BrowserRouter for useLocation)
const AppContent = () => {
  const location = useLocation();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    () => sessionStorage.getItem('adminAuth') === 'true'
  );
  const [isInvestorAuthenticated, setIsInvestorAuthenticated] = useState(
    () => sessionStorage.getItem('investorAuth') === 'true'
  );
  
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isInvestorRoute = location.pathname.startsWith('/investors');
  
  // Show popup only on Home, About, Blog, and Blog Post pages
  const showPopup = ['/', '/about', '/blog'].includes(location.pathname) || location.pathname.startsWith('/blog/');

  return (
    <Layout showLayout={!isAdminRoute && !isInvestorRoute} showPopup={showPopup}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/films" element={<Films />} />
        <Route path="/services" element={<TheDen />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/work-with-us" element={<WorkWithUs />} />
        
        {/* Legacy redirect */}
        <Route path="/den" element={<Navigate to="/services" replace />} />
        
        {/* Investor Portal Routes */}
        <Route 
          path="/investors" 
          element={
            isInvestorAuthenticated ? 
              <InvestorPortal onLogout={() => setIsInvestorAuthenticated(false)} /> : 
              <InvestorLogin onLogin={() => setIsInvestorAuthenticated(true)} />
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            isAdminAuthenticated ? 
              <Navigate to="/admin/dashboard" replace /> : 
              <AdminLogin onLogin={() => setIsAdminAuthenticated(true)} />
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute isAuthenticated={isAdminAuthenticated}>
              <AdminDashboard onLogout={() => setIsAdminAuthenticated(false)} />
            </ProtectedRoute>
          } 
        />
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
