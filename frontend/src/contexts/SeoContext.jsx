import React, { createContext, useContext, useState, useEffect } from 'react';

const API = process.env.REACT_APP_BACKEND_URL;

// Default SEO settings
const defaultSeoSettings = {
  global_seo: {
    site_name: 'Shadow Wolves Productions',
    site_url: 'https://www.shadowwolvesproductions.com.au',
    default_meta_title_template: '{pageTitle} | Shadow Wolves Productions',
    default_meta_description: 'Bold, genre-driven stories with teeth.',
    default_og_image_url: null,
    focus_keyword_default: null
  },
  organization_schema: {
    org_name: 'Shadow Wolves Productions',
    org_logo_url: null,
    org_sameas_links: '',
    enable_movie_schema: true,
    enable_faq_schema: true
  },
  robots: {
    robots_allow_all: true,
    robots_disallow_paths: '',
    robots_custom_override: null
  },
  sitemap: {
    sitemap_enabled: true,
    include_films: true,
    include_blog: true,
    include_armory: true,
    exclude_drafts: true,
    exclude_archived: true
  }
};

const SeoContext = createContext(defaultSeoSettings);

export const SeoProvider = ({ children }) => {
  const [seoSettings, setSeoSettings] = useState(defaultSeoSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeoSettings = async () => {
      try {
        const response = await fetch(`${API}/api/site-settings/seo`);
        if (response.ok) {
          const data = await response.json();
          setSeoSettings(prev => ({
            global_seo: { ...prev.global_seo, ...data.global_seo },
            organization_schema: { ...prev.organization_schema, ...data.organization_schema },
            robots: { ...prev.robots, ...data.robots },
            sitemap: { ...prev.sitemap, ...data.sitemap }
          }));
        }
      } catch (error) {
        console.error('Failed to fetch SEO settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeoSettings();
  }, []);

  return (
    <SeoContext.Provider value={{ ...seoSettings, loading }}>
      {children}
    </SeoContext.Provider>
  );
};

export const useSeoSettings = () => {
  return useContext(SeoContext);
};

// Helper function to generate page title from template
export const generatePageTitle = (pageTitle, template) => {
  if (!template) return pageTitle;
  return template.replace('{pageTitle}', pageTitle);
};

// Helper to generate Organization schema
export const generateOrganizationSchema = (settings) => {
  const { organization_schema, global_seo } = settings;
  
  if (!organization_schema.org_name) return null;
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": organization_schema.org_name,
    "url": global_seo.site_url || 'https://shadowwolvesproductions.com'
  };
  
  if (organization_schema.org_logo_url) {
    schema.logo = organization_schema.org_logo_url;
  }
  
  if (organization_schema.org_sameas_links) {
    const links = organization_schema.org_sameas_links
      .split('\n')
      .map(link => link.trim())
      .filter(link => link.length > 0);
    if (links.length > 0) {
      schema.sameAs = links;
    }
  }
  
  return schema;
};

// Helper to generate Movie schema
export const generateMovieSchema = (film, settings) => {
  if (!settings.organization_schema.enable_movie_schema) return null;
  if (!film) return null;
  
  const { organization_schema, global_seo } = settings;
  
  return {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": film.title,
    "description": film.logline || film.synopsis || '',
    "image": film.posterUrl || '',
    "genre": film.genres || [],
    "productionCompany": {
      "@type": "Organization",
      "name": organization_schema.org_name || 'Shadow Wolves Productions'
    },
    "url": `${global_seo.site_url || 'https://shadowwolvesproductions.com'}/films/${film.slug || film.id}`
  };
};

// Helper to get canonical URL
export const getCanonicalUrl = (path, settings) => {
  const baseUrl = settings?.global_seo?.site_url || 'https://shadowwolvesproductions.com';
  return `${baseUrl.replace(/\/$/, '')}${path}`;
};

export default SeoContext;
