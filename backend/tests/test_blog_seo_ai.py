"""
Blog SEO AI Generation Tests - Iteration 14
Tests for POST /api/ai/generate-blog-seo endpoint
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBlogSeoAI:
    """Tests for the blog SEO AI generation endpoint"""
    
    def test_generate_blog_seo_success(self):
        """Test that the endpoint returns correct JSON structure with all expected fields"""
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-blog-seo",
            json={
                "title": "Test Horror Film Production Guide",
                "content": "This is a comprehensive guide to horror film production, covering lighting, sound design, and practical effects.",
                "tags": ["horror", "film", "production"],
                "excerpt": ""
            },
            timeout=60  # AI calls take time
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify all expected fields are present
        assert "seo_title" in data, "Response missing seo_title"
        assert "seo_description" in data, "Response missing seo_description (meta description)"
        assert "excerpt" in data, "Response missing excerpt"
        assert "tags" in data, "Response missing tags"
        assert "seo_keywords" in data, "Response missing seo_keywords"
        
        # Verify field types
        assert isinstance(data["seo_title"], str), "seo_title should be string"
        assert isinstance(data["seo_description"], str), "seo_description should be string"
        assert isinstance(data["excerpt"], str), "excerpt should be string"
        assert isinstance(data["tags"], list), "tags should be list"
        assert isinstance(data["seo_keywords"], str), "seo_keywords should be string"
        
        # Verify character limits (SEO best practices)
        assert len(data["seo_title"]) <= 70, f"seo_title too long: {len(data['seo_title'])} chars"
        assert len(data["seo_description"]) <= 200, f"seo_description too long: {len(data['seo_description'])} chars"
        
        print(f"✓ SEO Title: {data['seo_title']}")
        print(f"✓ Meta Description: {data['seo_description'][:60]}...")
        print(f"✓ Excerpt: {data['excerpt'][:60]}...")
        print(f"✓ Tags: {data['tags']}")
        print(f"✓ Keywords: {data['seo_keywords'][:50]}...")
    
    def test_generate_blog_seo_with_minimal_input(self):
        """Test endpoint works with just a title (minimal input)"""
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-blog-seo",
            json={
                "title": "Quick Test Post",
                "content": "",
                "tags": [],
                "excerpt": ""
            },
            timeout=60
        )
        
        assert response.status_code == 200, f"Expected 200 with minimal input, got {response.status_code}"
        data = response.json()
        
        # Should still return all required fields
        assert "seo_title" in data
        assert "seo_description" in data
        assert "excerpt" in data
        assert "tags" in data
        assert "seo_keywords" in data
        
        print(f"✓ Minimal input test passed - generated SEO for title-only input")
    
    def test_generate_blog_seo_empty_title_validation(self):
        """Test that empty title is handled gracefully"""
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-blog-seo",
            json={
                "title": "",
                "content": "Some content without a title",
                "tags": [],
                "excerpt": ""
            },
            timeout=60
        )
        
        # Endpoint should still work with content, even without title
        # The frontend disables the button when title is empty, but API should handle gracefully
        assert response.status_code in [200, 400], f"Unexpected status: {response.status_code}"
        print(f"✓ Empty title handling: status {response.status_code}")
    
    def test_endpoint_exists_and_method(self):
        """Verify endpoint exists and accepts POST"""
        # Test wrong method returns 405
        get_response = requests.get(f"{BASE_URL}/api/ai/generate-blog-seo", timeout=10)
        assert get_response.status_code == 405, "GET should return 405 Method Not Allowed"
        
        print("✓ Endpoint correctly rejects GET method")


class TestBlogSeoComparison:
    """Compare blog SEO endpoint with existing product SEO endpoint"""
    
    def test_both_seo_endpoints_available(self):
        """Verify both product and blog SEO endpoints are available"""
        # Product SEO endpoint
        product_response = requests.post(
            f"{BASE_URL}/api/ai/generate-product-seo",
            json={
                "title": "Test Product",
                "positioning_line": "A great product",
                "what_this_is": "Product description",
                "tags": ["test"]
            },
            timeout=60
        )
        
        # Blog SEO endpoint
        blog_response = requests.post(
            f"{BASE_URL}/api/ai/generate-blog-seo",
            json={
                "title": "Test Blog Post",
                "content": "Blog content",
                "tags": ["test"],
                "excerpt": ""
            },
            timeout=60
        )
        
        assert product_response.status_code == 200, f"Product SEO failed: {product_response.status_code}"
        assert blog_response.status_code == 200, f"Blog SEO failed: {blog_response.status_code}"
        
        print("✓ Both SEO endpoints are working correctly")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
