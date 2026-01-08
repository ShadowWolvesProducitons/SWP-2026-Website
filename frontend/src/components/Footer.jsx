import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer bg-black border-t border-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Company Info & Contact */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="https://customer-assets.emergentagent.com/job_wolfmedia/artifacts/bifyh7bv_Black%20Logo%20Only.png"
                alt="Shadow Wolves Productions"
                className="h-14 w-auto" />

            </div>
            
            {/* Contact Info */}
            <div className="space-y-4 mt-6">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-electric-blue mt-1 flex-shrink-0" />
                <span className="text-sm">Sydney, Australia</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-electric-blue mt-1 flex-shrink-0" />
                <a href="mailto:info@shadowwolvesproductions.com.au" className="hover:text-white transition-colors !text-sm">admin@shadowwolvesproductions.com.au

                </a>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-electric-blue mt-1 flex-shrink-0" />
                <span className="!text-sm">+61 0420 984 558</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/films" className="text-sm hover:text-white transition-colors">Films</Link></li>
              <li><Link to="/services" className="text-sm hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/den" className="text-sm hover:text-white transition-colors">The Den</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-4 md:mb-0">
            © 2026 Shadow Wolves Productions Pty Ltd. All rights reserved.
          </p>
          
          {/* Social Links - Right Side */}
          <div className="flex gap-4">
            <a href="https://www.youtube.com/c/ShadowWolvesProductions" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-electric-blue transition-colors">
              <Youtube size={20} />
            </a>
            <a href="https://www.instagram.com/Shadow.Wolves.Productions" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-electric-blue transition-colors">
              <Instagram size={20} />
            </a>
            <a href="https://www.facebook.com/ShadowWolvesProductions1" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-electric-blue transition-colors">
              <Facebook size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>);

};

export default Footer;