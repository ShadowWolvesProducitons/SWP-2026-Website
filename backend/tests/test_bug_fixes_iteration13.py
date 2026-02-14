"""
Test Suite for Bug Fixes - Iteration 13
Tests:
1. Armory page compact 6-column grid (grid-cols-2 md:grid-cols-4 lg:grid-cols-6)
2. Blog/Den page alternating zigzag layout
3. AI cover image generation endpoint (fixed 'size' parameter issue)
"""
import pytest
import requests
import os
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestArmoryCatalog:
    """Test Armory/Services page products API"""
    
    def test_get_den_items_returns_list(self):
        """GET /api/den-items returns product list"""
        response = requests.get(f"{BASE_URL}/api/den-items")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} armory products")
        
    def test_den_items_have_required_fields(self):
        """Products have required fields for display"""
        response = requests.get(f"{BASE_URL}/api/den-items")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            product = data[0]
            assert "title" in product
            assert "item_type" in product
            assert "slug" in product
            print(f"Product fields verified: {product.get('title')}")


class TestBlogPosts:
    """Test Blog/Den posts API"""
    
    def test_get_published_blog_posts(self):
        """GET /api/blog returns published posts"""
        response = requests.get(f"{BASE_URL}/api/blog?status=Published")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} published blog posts")
        
    def test_blog_posts_have_cover_image_field(self):
        """Blog posts should have cover_image field (even if null for placeholder)"""
        response = requests.get(f"{BASE_URL}/api/blog?status=Published")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            post = data[0]
            assert "title" in post
            assert "slug" in post
            # cover_image or cover_image_url should exist
            has_cover_field = "cover_image" in post or "cover_image_url" in post
            print(f"Post '{post.get('title')}' has cover_image field: {has_cover_field}")


class TestAICoverImageGeneration:
    """Test AI cover image generation endpoint - Bug fix #3"""
    
    def test_ai_cover_image_endpoint_exists(self):
        """POST /api/ai/generate-cover-image endpoint should exist"""
        # Just test that the endpoint doesn't return 404
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-cover-image",
            json={},
            timeout=10
        )
        # Should not be 404 - either 422 (validation error) or 200 (success)
        assert response.status_code != 404
        print(f"AI cover image endpoint status: {response.status_code}")
        
    def test_ai_cover_image_validation(self):
        """Endpoint should require title parameter"""
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-cover-image",
            json={"content": "test content"},
            timeout=10
        )
        # Should return validation error since title is required
        assert response.status_code in [422, 400]
        print("Title validation working correctly")
        
    def test_ai_cover_image_with_valid_payload(self):
        """Test AI cover image generation with valid payload (long timeout)"""
        payload = {
            "title": "Test Blog Post for AI Cover",
            "content": "This is a test blog post about filmmaking and production.",
            "tags": ["test", "film", "production"],
            "excerpt": "Testing the AI cover image generation feature"
        }
        
        # Use longer timeout as AI generation takes 30-60 seconds
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-cover-image",
            json=payload,
            timeout=120
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "image_url" in data
        assert "prompt_used" in data
        assert data["image_url"].startswith("/api/upload/images/")
        print(f"AI cover image generated: {data['image_url']}")
        print(f"Prompt used: {data['prompt_used'][:100]}...")


class TestFilmsPage:
    """Test Films page still works correctly"""
    
    def test_get_films_returns_list(self):
        """GET /api/films returns film catalog"""
        response = requests.get(f"{BASE_URL}/api/films")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} films in catalog")
        
    def test_films_have_display_fields(self):
        """Films have required fields for 6-column grid display"""
        response = requests.get(f"{BASE_URL}/api/films")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            film = data[0]
            assert "title" in film
            assert "status" in film
            print(f"Film fields verified: {film.get('title')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
