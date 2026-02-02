import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { toast as sonnerToast } from 'sonner';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      sonnerToast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
        sonnerToast.success('Message sent successfully!');
        setFormData({ name: '', email: '', phone: '', service: '', message: '' });
      } else {
        const error = await response.json();
        sonnerToast.error(error.detail || 'Failed to send message');
      }
    } catch (err) {
      sonnerToast.error('Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page pt-20">
      {/* Page Header */}
      <section className="page-header py-24 bg-gradient-to-br from-black via-smoke-gray to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="md:text-7xl !font-bold !text-6xl mb-6 text-white" style={{ fontFamily: 'Cinzel, serif' }}>Get in Touch</h1>
          <p className="max-w-2xl !text-xl text-gray-400">Let us know a bit about your project, and one of the team will be in touch as soon as possible.

          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="contact-form-container">
              <h2 className="text-4xl font-bold text-white mb-8">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-gray-400 mb-2 text-sm uppercase tracking-wide">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 rounded-lg bg-smoke-gray border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue transition-colors"
                    placeholder="John Doe" />

                </div>

                <div>
                  <label htmlFor="email" className="block text-gray-400 mb-2 text-sm uppercase tracking-wide">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 rounded-lg bg-smoke-gray border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue transition-colors"
                    placeholder="john@example.com" />

                </div>

                <div>
                  <label htmlFor="phone" className="block text-gray-400 mb-2 text-sm uppercase tracking-wide">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-lg bg-smoke-gray border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue transition-colors"
                    placeholder="+61 XXX XXX XXX" />

                </div>

                <div>
                  <label htmlFor="service" className="block text-gray-400 mb-2 text-sm uppercase tracking-wide">
                    Service Interested In *
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 rounded-lg bg-smoke-gray border border-gray-700 text-white focus:outline-none focus:border-electric-blue transition-colors">

                    <option value="">Select a service</option>
                    <option value="development">Development</option>
                    <option value="pre-production">Pre-Production</option>
                    <option value="post-production">Post-Production</option>
                    <option value="full-production">Full Production</option>
                    <option value="consulting">Consulting</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-gray-400 mb-2 text-sm uppercase tracking-wide">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-6 py-4 rounded-lg bg-smoke-gray border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue transition-colors resize-none"
                    placeholder="Tell us about your project...">
                  </textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white px-8 py-5 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2">

                  <Send size={18} />
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="contact-info-container">
              <h2 className="text-4xl font-bold text-white mb-8">Contact Information</h2>
              
              <div className="space-y-8 mb-12">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-electric-blue/20 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-electric-blue">
                    <MapPin size={24} className="text-electric-blue" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-2">Address</h3>
                    <p className="text-gray-400">Sydney, Australia</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-electric-blue/20 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-electric-blue">
                    <Mail size={24} className="text-electric-blue" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-2">Email</h3>
                    <a href="mailto:info@shadowwolvesproductions.com.au" className="text-gray-400 hover:text-white transition-colors">admin@shadowwolvesproductions.com.au

                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-electric-blue/20 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-electric-blue">
                    <Phone size={24} className="text-electric-blue" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-2">Phone</h3>
                    <p className="text-gray-400">+61 0420 984 558</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join The Pack Newsletter Section */}
      <section className="join-pack-newsletter py-20 bg-gradient-to-br from-navy-dark via-black to-navy-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="md:text-5xl !font-bold !text-4xl mb-4 text-white" style={{ fontFamily: 'Cinzel, serif' }}>Join the Pack

          </h2>
          <p className="max-w-2xl !text-lg mb-8 mx-auto text-gray-300">Inside access to casting calls, industry updates, and the tools, apps, and templates we actually use.

          </p>
          
          <div className="max-w-md mx-auto">
            {newsletterSubscribed ? (
              <div className="flex items-center justify-center gap-3 text-green-400">
                <CheckCircle size={24} />
                <span>You're in. Welcome to the pack.</span>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!newsletterEmail) return;
                
                setNewsletterSubmitting(true);
                try {
                  const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: newsletterEmail, source: 'contact_page' })
                  });
                  
                  if (response.ok) {
                    setNewsletterSubscribed(true);
                    sonnerToast.success('Welcome to the pack!');
                  } else {
                    const error = await response.json();
                    sonnerToast.error(error.detail || 'Failed to subscribe');
                  }
                } catch (err) {
                  sonnerToast.error('Connection error. Please try again.');
                } finally {
                  setNewsletterSubmitting(false);
                }
              }} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 rounded-full bg-smoke-gray border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue transition-colors" />

                <button
                  type="submit"
                  disabled={newsletterSubmitting}
                  className="bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2">
                  {newsletterSubmitting ? 'Subscribing...' : '📬 Subscribe'}
                </button>
              </form>
            )}
            <p className="text-gray-500 text-xs mt-4">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </div>
      </section>
    </div>);

};

export default Contact;