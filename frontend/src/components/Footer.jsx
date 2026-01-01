import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer bg-black border-t border-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="https://customer-assets.emergentagent.com/job_wolfmedia/artifacts/bifyh7bv_Black%20Logo%20Only.png" 
                alt="Shadow Wolves Productions"
                className="h-12 w-auto"
              />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Crafting cinematic experiences that captivate audiences and tell unforgettable stories.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-electric-blue transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-electric-blue transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-electric-blue transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-electric-blue transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/films" className="text-sm hover:text-white transition-colors">Films</Link></li>
              <li><Link to="/services" className="text-sm hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/apps" className="text-sm hover:text-white transition-colors">Apps</Link></li>
              <li><Link to="/templates" className="text-sm hover:text-white transition-colors">Templates</Link></li>
              <li><Link to="/downloads" className="text-sm hover:text-white transition-colors">Downloads</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wide">Services</h3>
            <ul className="space-y-3">
              <li><span className="text-sm">Development</span></li>
              <li><span className="text-sm">Pre-Production</span></li>
              <li><span className="text-sm">Post-Production</span></li>
              <li><span className="text-sm">Cinematography</span></li>
              <li><span className="text-sm">Sound Design</span></li>
              <li><span className="text-sm">Visual Effects</span></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wide">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-electric-blue mt-1 flex-shrink-0" />
                <span className="text-sm">Sydney, Australia</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-electric-blue mt-1 flex-shrink-0" />
                <a href="mailto:info@shadowwolvesproductions.com.au" className="text-sm hover:text-white transition-colors">
                  info@shadowwolvesproductions.com.au
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-electric-blue mt-1 flex-shrink-0" />
                <span className="text-sm">+61 (0)2 XXXX XXXX</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Shadow Wolves Productions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;