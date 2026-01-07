import React, { useEffect, useState } from 'react';
import { apps, templates, ebooks } from '../mock';
import { Smartphone, Download, FileText, BookOpen, GraduationCap } from 'lucide-react';

const TheDen = () => {
  const [activeTab, setActiveTab] = useState('apps');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tabs = [
    { id: 'apps', label: 'Apps', icon: Smartphone },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'downloads', label: 'Downloads', icon: BookOpen },
    { id: 'courses', label: 'Courses', icon: GraduationCap }
  ];

  return (
    <div className="the-den-page pt-20">
      {/* Page Header */}
      <section className="page-header py-24 bg-gradient-to-br from-black via-navy-dark to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">The Den</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your creative arsenal — apps, templates, downloads, and courses to evolve your craft
          </p>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="tabs-navigation py-8 bg-smoke-gray border-b border-gray-800 sticky top-20 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-2 flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full text-sm font-mono uppercase tracking-widest transition-all inline-flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-electric-blue text-white'
                      : 'bg-black text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="tab-content py-16 bg-black min-h-screen">
        <div className="container mx-auto px-4">
          {/* Apps Tab */}
          {activeTab === 'apps' && (
            <div className="apps-content">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Production Apps</h2>
                <p className="text-lg text-gray-400">Professional tools to streamline your filmmaking workflow</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {apps.map((app) => (
                  <div
                    key={app.id}
                    className="app-card bg-smoke-gray rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition-all hover:transform hover:-translate-y-2"
                  >
                    <div
                      className="app-header h-48 p-8 flex items-center justify-center"
                      style={{ backgroundColor: `${app.color}15` }}
                    >
                      <Smartphone size={64} style={{ color: app.color }} />
                    </div>
                    <div className="app-content p-6">
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold text-white mb-2">{app.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span className="px-3 py-1 rounded-full bg-black border border-gray-700 font-mono uppercase tracking-wide">
                            {app.platform}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-6 leading-relaxed">{app.description}</p>
                      <div className="mb-6">
                        <div className="text-sm text-gray-400 mb-3 uppercase tracking-wide">Key Features:</div>
                        <ul className="space-y-2">
                          {app.features.map((feature, idx) => (
                            <li key={idx} className="text-gray-300 text-sm flex items-center gap-2">
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: app.color }}
                              ></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white py-3 rounded-full font-mono text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                        <Download size={18} />
                        Download App
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="templates-content">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Production Templates</h2>
                <p className="text-lg text-gray-400">Professional templates to streamline your workflow</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="template-card bg-smoke-gray p-6 rounded-lg border border-gray-800 hover:border-gray-600 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-electric-blue/20 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-electric-blue">
                        <FileText size={32} className="text-electric-blue" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 text-xs rounded-full bg-black text-electric-blue border border-electric-blue/30 uppercase tracking-wide font-mono">
                            {template.category}
                          </span>
                          <span className="text-gray-500 text-sm">{template.format}</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-4 leading-relaxed">{template.description}</p>
                        <button
                          className="bg-electric-blue hover:bg-electric-blue/90 text-white px-6 py-2 rounded-full font-mono text-xs uppercase tracking-widest transition-all inline-flex items-center gap-2"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Downloads Tab */}
          {activeTab === 'downloads' && (
            <div className="downloads-content">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Free Downloads</h2>
                <p className="text-lg text-gray-400">Ebooks and guides to master the art of filmmaking</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {ebooks.map((ebook) => (
                  <div
                    key={ebook.id}
                    className="ebook-card bg-smoke-gray rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition-all hover:transform hover:-translate-y-2"
                  >
                    <div
                      className="ebook-cover h-64 p-8 flex items-center justify-center"
                      style={{ backgroundColor: ebook.cover }}
                    >
                      <BookOpen size={80} className="text-white opacity-40" />
                    </div>
                    <div className="ebook-content p-6">
                      <div className="mb-4">
                        <span className="px-3 py-1 text-xs rounded-full bg-black text-electric-blue border border-electric-blue/30 uppercase tracking-wide font-mono">
                          {ebook.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{ebook.title}</h3>
                      <p className="text-gray-300 text-sm mb-4 leading-relaxed">{ebook.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                        <span>{ebook.pages} pages</span>
                        <span>{ebook.format}</span>
                      </div>
                      <button
                        className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white py-3 rounded-full font-mono text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                        <Download size={16} />
                        Free Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="courses-content">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Filmmaking Courses</h2>
                <p className="text-lg text-gray-400">Learn from industry professionals and master your craft</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Course 1 */}
                <div className="course-card bg-smoke-gray rounded-lg overflow-hidden border border-gray-800 hover:border-electric-blue transition-all hover:transform hover:-translate-y-2">
                  <div className="course-image h-48 bg-gradient-to-br from-electric-blue/20 to-navy-dark flex items-center justify-center">
                    <GraduationCap size={64} className="text-electric-blue" />
                  </div>
                  <div className="course-content p-6">
                    <span className="px-3 py-1 text-xs rounded-full bg-electric-blue/20 text-electric-blue border border-electric-blue/30 uppercase tracking-wide font-mono">
                      Coming Soon
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-4 mb-2">Cinematic Storytelling</h3>
                    <p className="text-gray-300 mb-4">Master the art of visual narrative and create compelling stories that resonate with audiences.</p>
                    <div className="text-sm text-gray-400 mb-4">
                      <div>12 Lessons • 8 Hours</div>
                    </div>
                    <button className="w-full bg-gray-700 text-gray-400 py-3 rounded-full font-mono text-xs uppercase tracking-widest cursor-not-allowed">
                      Launching Soon
                    </button>
                  </div>
                </div>

                {/* Course 2 */}
                <div className="course-card bg-smoke-gray rounded-lg overflow-hidden border border-gray-800 hover:border-electric-blue transition-all hover:transform hover:-translate-y-2">
                  <div className="course-image h-48 bg-gradient-to-br from-navy-dark to-electric-blue/20 flex items-center justify-center">
                    <GraduationCap size={64} className="text-electric-blue" />
                  </div>
                  <div className="course-content p-6">
                    <span className="px-3 py-1 text-xs rounded-full bg-electric-blue/20 text-electric-blue border border-electric-blue/30 uppercase tracking-wide font-mono">
                      Coming Soon
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-4 mb-2">Advanced Color Grading</h3>
                    <p className="text-gray-300 mb-4">Transform your footage with professional color grading techniques used in major productions.</p>
                    <div className="text-sm text-gray-400 mb-4">
                      <div>15 Lessons • 10 Hours</div>
                    </div>
                    <button className="w-full bg-gray-700 text-gray-400 py-3 rounded-full font-mono text-xs uppercase tracking-widest cursor-not-allowed">
                      Launching Soon
                    </button>
                  </div>
                </div>

                {/* Course 3 */}
                <div className="course-card bg-smoke-gray rounded-lg overflow-hidden border border-gray-800 hover:border-electric-blue transition-all hover:transform hover:-translate-y-2">
                  <div className="course-image h-48 bg-gradient-to-br from-electric-blue/20 to-black flex items-center justify-center">
                    <GraduationCap size={64} className="text-electric-blue" />
                  </div>
                  <div className="course-content p-6">
                    <span className="px-3 py-1 text-xs rounded-full bg-electric-blue/20 text-electric-blue border border-electric-blue/30 uppercase tracking-wide font-mono">
                      Coming Soon
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-4 mb-2">Sound Design Mastery</h3>
                    <p className="text-gray-300 mb-4">Create immersive soundscapes and learn professional audio post-production techniques.</p>
                    <div className="text-sm text-gray-400 mb-4">
                      <div>10 Lessons • 6 Hours</div>
                    </div>
                    <button className="w-full bg-gray-700 text-gray-400 py-3 rounded-full font-mono text-xs uppercase tracking-widest cursor-not-allowed">
                      Launching Soon
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center mt-12 p-8 bg-smoke-gray rounded-lg border border-gray-800">
                <GraduationCap size={48} className="text-electric-blue mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">More Courses Coming Soon</h3>
                <p className="text-gray-400 mb-6">Be the first to know when we launch our comprehensive filmmaking courses</p>
                <button className="bg-electric-blue hover:bg-electric-blue/90 text-white px-8 py-3 rounded-full font-mono text-sm uppercase tracking-widest transition-all">
                  Join the Waitlist
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TheDen;
