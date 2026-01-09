import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Films from "./pages/Films";
import Services from "./pages/Services";
import TheDen from "./pages/TheDen";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { Toaster } from "./components/ui/sonner";

// Layout wrapper that conditionally renders Header/Footer
const Layout = ({ children, showLayout }) => {
  if (!showLayout) {
    return <>{children}</>;
  }
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
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
  
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <Layout showLayout={!isAdminRoute}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/films" element={<Films />} />
        <Route path="/services" element={<TheDen />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        
        {/* Legacy redirect */}
        <Route path="/den" element={<Navigate to="/services" replace />} />
        
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
