import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create mailto link with form data
    const subject = encodeURIComponent(`Contact Form: ${formData.service || 'General Inquiry'}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Phone: ${formData.phone}\n` +
      `Service: ${formData.service}\n\n` +
      `Message:\n${formData.message}`
    );

    // Open user's email client
    window.location.href = `mailto:info@shadowwolvesproductions.com.au?subject=${subject}&body=${body}`;

    toast({
      title: "Opening Email Client",
      description: "Your message will be sent via your email application."
    });

    // Reset form after a delay
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });
    }, 1000);
  };

  return (
    <div className="contact-page pt-20">
      {/* Page Header */}
      <section className="page-header py-24 bg-gradient-to-br from-black via-smoke-gray to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="md:text-7xl !font-bold !text-6xl mb-6 text-white">Get in Touch</h1>
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
    </div>);

};

export default Contact;