import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Films', path: '/films' },
    { name: 'Services', path: '/services' },
    { name: 'Apps', path: '/apps' },
    { name: 'Templates', path: '/templates' },
    { name: 'Downloads', path: '/downloads' },
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
            <div className="w-12 h-12 bg-crimson-red rounded-full flex items-center justify-center group-hover:bg-crimson-red/80 transition-colors">
              <span className="text-white font-bold text-xl">SW</span>
            </div>
            <div className="hidden md:block">
              <div className="text-white font-bold text-lg leading-tight">SHADOW WOLVES</div>
              <div className="text-gray-400 text-xs uppercase tracking-widest">Productions</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link text-sm uppercase tracking-widest font-mono transition-colors ${
                  isActive(link.path) 
                    ? 'text-crimson-red' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
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
                    ? 'text-crimson-red' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;