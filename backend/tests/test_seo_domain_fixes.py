"""
Test SEO Domain Consistency Fixes - Iteration 24
Tests:
1. robots.txt uses correct production URL
2. sitemap.xml uses correct production URL for all loc entries
3. sitemap.xml blog URLs are properly slugified (no spaces)
4. sitemap.xml includes /armory route (not /services)
"""
import pytest
import requests
import os
import re

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestRobotsTxt:
    """Tests for robots.txt SEO endpoint"""
    
    def test_robots_txt_returns_200(self):
        """robots.txt endpoint returns success"""
        response = requests.get(f"{BASE_URL}/api/seo/robots.txt")
        assert response.status_code == 200
        print("✅ robots.txt returns 200")
    
    def test_robots_txt_uses_production_url(self):
        """robots.txt sitemap line uses correct production URL"""
        response = requests.get(f"{BASE_URL}/api/seo/robots.txt")
        content = response.text
        
        # Must contain sitemap with www.shadowwolvesproductions.com.au
        assert "Sitemap: https://www.shadowwolvesproductions.com.au/sitemap.xml" in content
        print("✅ robots.txt uses correct production URL in sitemap line")
    
    def test_robots_txt_disallows_admin_paths(self):
        """robots.txt disallows admin and sensitive paths"""
        response = requests.get(f"{BASE_URL}/api/seo/robots.txt")
        content = response.text
        
        assert "Disallow: /admin" in content
        assert "Disallow: /api" in content
        assert "Disallow: /studio-access" in content
        print("✅ robots.txt disallows admin, api, and studio-access paths")


class TestSitemapXml:
    """Tests for sitemap.xml SEO endpoint"""
    
    def test_sitemap_xml_returns_200(self):
        """sitemap.xml endpoint returns success"""
        response = requests.get(f"{BASE_URL}/api/seo/sitemap.xml")
        assert response.status_code == 200
        print("✅ sitemap.xml returns 200")
    
    def test_sitemap_xml_valid_format(self):
        """sitemap.xml returns valid XML format"""
        response = requests.get(f"{BASE_URL}/api/seo/sitemap.xml")
        content = response.text
        
        assert '<?xml version="1.0" encoding="UTF-8"?>' in content
        assert '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' in content
        assert '</urlset>' in content
        print("✅ sitemap.xml has valid XML structure")
    
    def test_sitemap_uses_production_url(self):
        """All sitemap loc entries use production URL"""
        response = requests.get(f"{BASE_URL}/api/seo/sitemap.xml")
        content = response.text
        
        # Extract all loc entries
        loc_pattern = r'<loc>(.*?)</loc>'
        loc_entries = re.findall(loc_pattern, content)
        
        assert len(loc_entries) > 0, "Should have at least one URL entry"
        
        for loc in loc_entries:
            assert loc.startswith("https://www.shadowwolvesproductions.com.au"), \
                f"URL {loc} does not use production domain"
        
        print(f"✅ All {len(loc_entries)} sitemap URLs use production domain")
    
    def test_sitemap_includes_armory_route(self):
        """Sitemap includes /armory static page"""
        response = requests.get(f"{BASE_URL}/api/seo/sitemap.xml")
        content = response.text
        
        assert "https://www.shadowwolvesproductions.com.au/armory</loc>" in content
        assert "/services" not in content  # Should NOT have /services
        print("✅ Sitemap includes /armory route (not /services)")
    
    def test_sitemap_blog_urls_slugified(self):
        """Blog URLs in sitemap are properly slugified (no spaces)"""
        response = requests.get(f"{BASE_URL}/api/seo/sitemap.xml")
        content = response.text
        
        # Extract blog URLs
        blog_pattern = r'<loc>(https://www\.shadowwolvesproductions\.com\.au/blog/[^<]+)</loc>'
        blog_urls = re.findall(blog_pattern, content)
        
        for url in blog_urls:
            # URL should not contain spaces or encoded spaces (%20)
            assert " " not in url, f"Blog URL contains space: {url}"
            assert "%20" not in url, f"Blog URL contains encoded space: {url}"
            
            # Extract slug part
            slug = url.split('/blog/')[-1]
            # Slug should be lowercase, contain only letters, numbers, and hyphens
            assert re.match(r'^[a-z0-9\-]+$', slug), \
                f"Blog slug not properly formatted: {slug}"
        
        print(f"✅ {len(blog_urls)} blog URLs are properly slugified")
    
    def test_sitemap_includes_static_pages(self):
        """Sitemap includes all required static pages"""
        response = requests.get(f"{BASE_URL}/api/seo/sitemap.xml")
        content = response.text
        
        expected_pages = [
            "https://www.shadowwolvesproductions.com.au/</loc>",  # Home
            "https://www.shadowwolvesproductions.com.au/films</loc>",
            "https://www.shadowwolvesproductions.com.au/armory</loc>",
            "https://www.shadowwolvesproductions.com.au/blog</loc>",
            "https://www.shadowwolvesproductions.com.au/work-with-us</loc>",
        ]
        
        for page in expected_pages:
            assert page in content, f"Missing static page: {page}"
        
        print("✅ All required static pages present in sitemap")
    
    def test_sitemap_dynamic_films(self):
        """Sitemap includes dynamic film pages"""
        response = requests.get(f"{BASE_URL}/api/seo/sitemap.xml")
        content = response.text
        
        # Check for film URLs pattern
        film_pattern = r'<loc>https://www\.shadowwolvesproductions\.com\.au/films/[a-z0-9\-]+</loc>'
        film_matches = re.findall(film_pattern, content)
        
        assert len(film_matches) > 0, "Should have at least one film URL"
        print(f"✅ {len(film_matches)} film pages in sitemap")
    
    def test_sitemap_dynamic_armory(self):
        """Sitemap includes dynamic armory item pages"""
        response = requests.get(f"{BASE_URL}/api/seo/sitemap.xml")
        content = response.text
        
        # Check for armory URLs pattern
        armory_pattern = r'<loc>https://www\.shadowwolvesproductions\.com\.au/armory/[a-z0-9\-]+</loc>'
        armory_matches = re.findall(armory_pattern, content)
        
        assert len(armory_matches) > 0, "Should have at least one armory item URL"
        print(f"✅ {len(armory_matches)} armory item pages in sitemap")


class TestSeoSettings:
    """Tests for SEO settings API"""
    
    def test_seo_settings_returns_correct_url(self):
        """SEO settings API returns correct site URL"""
        response = requests.get(f"{BASE_URL}/api/site-settings/seo")
        assert response.status_code == 200
        
        data = response.json()
        site_url = data.get("global_seo", {}).get("site_url", "")
        
        # Should default to production URL if not customized
        assert "shadowwolvesproductions.com.au" in site_url or site_url == ""
        print("✅ SEO settings API working correctly")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
