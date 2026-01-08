import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Settings } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Films', path: '/films' },
    { name: 'Services', path: '/services' },
    { name: 'The Den', path: '/den' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="logo flex items-center gap-3 group">
            <img 
              src="https://customer-assets.emergentagent.com/job_wolfmedia/artifacts/bifyh7bv_Black%20Logo%20Only.png" 
              alt="Shadow Wolves Productions"
              className="h-12 w-auto transition-opacity group-hover:opacity-80"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link text-sm uppercase tracking-widest font-mono transition-colors ${
                  isActive(link.path) 
                    ? 'text-electric-blue' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {/* TODO: Remove this admin button before production */}
            <Link
              to="/admin"
              className="ml-4 p-2 text-gray-500 hover:text-electric-blue transition-colors"
              title="Admin Panel"
            >
              <Settings size={18} />
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-6 border-t border-gray-800">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block py-3 text-sm uppercase tracking-widest font-mono transition-colors ${
                  isActive(link.path) 
                    ? 'text-electric-blue' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {/* TODO: Remove this admin link before production */}
            <Link
              to="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="block py-3 text-sm uppercase tracking-widest font-mono text-gray-500 hover:text-electric-blue transition-colors"
            >
              Admin
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;