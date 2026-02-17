"""
Tests for Image Compression and SEO Features
- Image upload with WebP conversion
- Image upload without WebP conversion (keep original format)
- Asset upload with compression
- SEO settings API
- Robots.txt generation
- Sitemap.xml generation
"""

import pytest
import requests
import os
from pathlib import Path

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Create test image files
@pytest.fixture(scope="module")
def test_images():
    """Create test images for upload testing"""
    from PIL import Image
    import tempfile
    
    # Create a test PNG image
    png_path = Path(tempfile.gettempdir()) / "test_upload.png"
    img = Image.new('RGB', (500, 500), color='blue')
    img.save(png_path)
    
    # Create a test JPG image
    jpg_path = Path(tempfile.gettempdir()) / "test_upload.jpg"
    img.save(jpg_path, format='JPEG')
    
    yield {"png": str(png_path), "jpg": str(jpg_path)}
    
    # Cleanup
    if png_path.exists():
        png_path.unlink()
    if jpg_path.exists():
        jpg_path.unlink()


class TestImageUploadCompression:
    """Tests for image upload with compression and WebP conversion"""
    
    def test_png_upload_converts_to_webp(self, test_images):
        """POST /api/upload/image - PNG should convert to WebP by default"""
        with open(test_images["png"], "rb") as f:
            response = requests.post(
                f"{BASE_URL}/api/upload/image",
                files={"file": ("test.png", f, "image/png")},
                data={"auto_library": "false", "source": "pytest"}
            )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "filename" in data
        assert "url" in data
        assert "original_size" in data
        assert "compressed_size" in data
        assert "savings_percent" in data
        assert "format" in data
        
        # Verify WebP conversion
        assert data["format"] == "WEBP", f"Expected WEBP format, got {data['format']}"
        assert data["filename"].endswith(".webp"), f"Filename should end with .webp"
        
        # Verify compression happened
        assert data["compressed_size"] <= data["original_size"], "Compressed size should be <= original"
        print(f"PNG->WebP compression: {data['savings_percent']}% savings")
    
    def test_jpg_upload_converts_to_webp(self, test_images):
        """POST /api/upload/image - JPG should convert to WebP by default"""
        with open(test_images["jpg"], "rb") as f:
            response = requests.post(
                f"{BASE_URL}/api/upload/image",
                files={"file": ("test.jpg", f, "image/jpeg")},
                data={"auto_library": "false", "source": "pytest"}
            )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["format"] == "WEBP"
        assert data["filename"].endswith(".webp")
        print(f"JPG->WebP compression: {data['savings_percent']}% savings")
    
    def test_upload_without_webp_conversion(self, test_images):
        """POST /api/upload/image with convert_webp=false keeps original format"""
        with open(test_images["jpg"], "rb") as f:
            response = requests.post(
                f"{BASE_URL}/api/upload/image",
                files={"file": ("test.jpg", f, "image/jpeg")},
                data={"auto_library": "false", "convert_webp": "false", "source": "pytest"}
            )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should keep original JPG format but still compress
        assert data["format"] == "JPG", f"Expected JPG format, got {data['format']}"
        assert data["filename"].endswith(".jpg") or data["filename"].endswith(".jpeg")
        assert "savings_percent" in data
        print(f"JPG compression (no WebP): {data['savings_percent']}% savings")
    
    def test_upload_png_without_webp_conversion(self, test_images):
        """POST /api/upload/image with convert_webp=false keeps PNG format"""
        with open(test_images["png"], "rb") as f:
            response = requests.post(
                f"{BASE_URL}/api/upload/image",
                files={"file": ("test.png", f, "image/png")},
                data={"auto_library": "false", "convert_webp": "false", "source": "pytest"}
            )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should keep original PNG format
        assert data["format"] == "PNG", f"Expected PNG format, got {data['format']}"
        assert data["filename"].endswith(".png")


class TestAssetUploadCompression:
    """Tests for asset upload with compression"""
    
    def test_asset_upload_compresses_and_converts_to_webp(self, test_images):
        """POST /api/assets - Should compress images and convert to WebP"""
        with open(test_images["png"], "rb") as f:
            response = requests.post(
                f"{BASE_URL}/api/assets",
                files={"file": ("test_asset.png", f, "image/png")},
                data={
                    "asset_type": "image",
                    "visibility": "admin_only",
                    "collection": "website",
                    "convert_webp": "true"
                }
            )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify asset structure
        assert "id" in data
        assert "filename" in data
        assert "file_url" in data
        assert "file_size" in data
        assert "original_size" in data
        assert "compression" in data
        
        # Verify WebP conversion
        assert data["filename"].endswith(".webp"), f"Expected .webp file, got {data['filename']}"
        assert data["mime_type"] == "image/webp"
        
        # Verify compression stats
        compression = data["compression"]
        assert "original_size" in compression
        assert "compressed_size" in compression
        assert "savings_percent" in compression
        print(f"Asset compression: {compression['savings_percent']}% savings")


class TestSeoSettings:
    """Tests for SEO settings API"""
    
    def test_get_seo_settings(self):
        """GET /api/site-settings/seo - Should return all SEO configuration"""
        response = requests.get(f"{BASE_URL}/api/site-settings/seo")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify all SEO sections are present
        assert "global_seo" in data
        assert "organization_schema" in data
        assert "robots" in data
        assert "sitemap" in data
        
        # Verify global_seo fields
        global_seo = data["global_seo"]
        assert "site_name" in global_seo
        assert "site_url" in global_seo
        assert "default_meta_title_template" in global_seo
        assert "default_meta_description" in global_seo
        
        # Verify robots fields
        robots = data["robots"]
        assert "robots_allow_all" in robots
        assert "robots_disallow_paths" in robots
        
        # Verify sitemap fields
        sitemap = data["sitemap"]
        assert "sitemap_enabled" in sitemap
        assert "include_films" in sitemap
        assert "include_blog" in sitemap
        
        print(f"SEO Settings - Site: {global_seo.get('site_name')}")


class TestRobotsTxt:
    """Tests for robots.txt generation"""
    
    def test_robots_txt_endpoint(self):
        """GET /api/seo/robots.txt - Should return dynamically generated robots.txt"""
        response = requests.get(f"{BASE_URL}/api/seo/robots.txt")
        
        assert response.status_code == 200
        assert "text/plain" in response.headers.get("content-type", "")
        
        content = response.text
        
        # Verify required content
        assert "User-agent:" in content
        assert "Sitemap:" in content
        
        # Verify disallowed paths
        assert "Disallow: /admin" in content
        assert "Disallow: /api" in content
        assert "Disallow: /studio-access" in content
        
        print("Robots.txt content verified")
    
    def test_robots_txt_contains_sitemap_reference(self):
        """Robots.txt should include sitemap URL"""
        response = requests.get(f"{BASE_URL}/api/seo/robots.txt")
        content = response.text
        
        assert "Sitemap:" in content
        # Should point to production URL
        assert "sitemap.xml" in content


class TestSitemapXml:
    """Tests for sitemap.xml generation"""
    
    def test_sitemap_xml_endpoint(self):
        """GET /api/seo/sitemap.xml - Should return dynamically generated sitemap"""
        response = requests.get(f"{BASE_URL}/api/seo/sitemap.xml")
        
        assert response.status_code == 200
        assert "xml" in response.headers.get("content-type", "")
        
        content = response.text
        
        # Verify XML structure
        assert '<?xml version="1.0"' in content
        assert '<urlset' in content
        assert '</urlset>' in content
        
        # Verify has URLs
        assert '<url>' in content
        assert '<loc>' in content
        
        print("Sitemap.xml structure verified")
    
    def test_sitemap_contains_static_pages(self):
        """Sitemap should include static pages"""
        response = requests.get(f"{BASE_URL}/api/seo/sitemap.xml")
        content = response.text
        
        # Should include main static pages
        assert "/films</loc>" in content or "/films<" in content
        assert "/blog</loc>" in content or "/blog<" in content
        assert "/armory</loc>" in content or "/armory<" in content
        assert "/work-with-us</loc>" in content or "/work-with-us<" in content
    
    def test_sitemap_contains_dynamic_content(self):
        """Sitemap should include dynamic film and blog URLs"""
        response = requests.get(f"{BASE_URL}/api/seo/sitemap.xml")
        content = response.text
        
        # Should have film detail pages
        assert "/films/" in content
        
        # Count number of URL entries
        url_count = content.count("<url>")
        assert url_count >= 5, f"Expected at least 5 URLs, found {url_count}"
        print(f"Sitemap contains {url_count} URLs")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
