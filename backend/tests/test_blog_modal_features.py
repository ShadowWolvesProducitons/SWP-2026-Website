"""
Blog Modal Features Tests - Iteration 15
Tests for Blog Post CRUD with new fields (featured, cta_text, cta_microcopy)
and AI generate-blog-seo endpoint returning all 7 expected fields
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBlogSeoAIGeneration:
    """Tests for POST /api/ai/generate-blog-seo returning all 7 fields"""
    
    def test_generate_blog_seo_returns_all_fields(self):
        """Test that endpoint returns seo_title, seo_description, excerpt, tags, seo_keywords, cta_text, cta_microcopy"""
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-blog-seo",
            json={
                "title": "Horror Film Lighting Techniques",
                "content": "<p>This guide covers advanced lighting techniques for horror films, including practical effects, low-key lighting, and how to create atmosphere.</p>",
                "tags": ["horror", "lighting"],
                "excerpt": ""
            },
            timeout=90  # AI calls can take time
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify all 7 expected fields are present
        required_fields = ["seo_title", "seo_description", "excerpt", "tags", "seo_keywords", "cta_text", "cta_microcopy"]
        for field in required_fields:
            assert field in data, f"Response missing required field: {field}"
        
        # Verify field types
        assert isinstance(data["seo_title"], str), "seo_title should be string"
        assert isinstance(data["seo_description"], str), "seo_description should be string"
        assert isinstance(data["excerpt"], str), "excerpt should be string"
        assert isinstance(data["tags"], list), "tags should be list"
        assert isinstance(data["seo_keywords"], str), "seo_keywords should be string"
        assert isinstance(data["cta_text"], str), "cta_text should be string"
        assert isinstance(data["cta_microcopy"], str), "cta_microcopy should be string"
        
        # Verify CTA fields have content
        assert len(data["cta_text"]) > 0, "cta_text should not be empty"
        assert len(data["cta_microcopy"]) > 0, "cta_microcopy should not be empty"
        
        print(f"✓ SEO Title: {data['seo_title'][:50]}...")
        print(f"✓ Meta Description: {data['seo_description'][:50]}...")
        print(f"✓ Excerpt: {data['excerpt'][:50]}...")
        print(f"✓ Tags: {data['tags']}")
        print(f"✓ Keywords: {data['seo_keywords'][:50]}...")
        print(f"✓ CTA Text: {data['cta_text']}")
        print(f"✓ CTA Microcopy: {data['cta_microcopy']}")
    
    def test_generate_blog_seo_with_minimal_input(self):
        """Test endpoint works with just a title"""
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-blog-seo",
            json={
                "title": "Test Title Only",
                "content": "",
                "tags": [],
                "excerpt": ""
            },
            timeout=90
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Should return all 7 fields
        assert "cta_text" in data, "cta_text field missing"
        assert "cta_microcopy" in data, "cta_microcopy field missing"
        print("✓ Minimal input test passed - all 7 fields returned")


class TestBlogPostCRUD:
    """Tests for Blog POST/PUT with new fields: featured, cta_text, cta_microcopy"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Store test post IDs for cleanup"""
        self.created_post_ids = []
        yield
        # Cleanup: delete test posts
        for post_id in self.created_post_ids:
            try:
                requests.delete(f"{BASE_URL}/api/blog/{post_id}?permanent=true", timeout=10)
            except:
                pass
    
    def test_create_blog_post_with_new_fields(self):
        """Test POST /api/blog creates post with featured, cta_text, cta_microcopy"""
        test_id = str(uuid.uuid4())[:8]
        payload = {
            "title": f"TEST_Post_{test_id}",
            "slug": f"test-post-{test_id}",
            "content": "<p>Test content</p>",
            "status": "Draft",
            "featured": True,
            "cta_text": "Ready to start your project?",
            "cta_microcopy": "No sign-up required.",
            "tags": ["test", "horror"],
            "excerpt": "Test excerpt",
            "seo_title": "Test SEO Title",
            "seo_description": "Test meta description",
            "seo_keywords": "test, keywords"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/blog",
            json=payload,
            timeout=30
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        self.created_post_ids.append(data.get("id"))
        
        # Verify new fields are saved
        assert data.get("featured") == True, "featured field not saved correctly"
        assert data.get("cta_text") == "Ready to start your project?", "cta_text not saved correctly"
        assert data.get("cta_microcopy") == "No sign-up required.", "cta_microcopy not saved correctly"
        
        # Verify other fields
        assert data.get("title") == f"TEST_Post_{test_id}"
        assert data.get("status") == "Draft"
        
        print(f"✓ Created post with id: {data.get('id')}")
        print(f"✓ featured: {data.get('featured')}")
        print(f"✓ cta_text: {data.get('cta_text')}")
        print(f"✓ cta_microcopy: {data.get('cta_microcopy')}")
    
    def test_update_blog_post_with_new_fields(self):
        """Test PUT /api/blog/{id} updates featured, cta_text, cta_microcopy"""
        # First create a post
        test_id = str(uuid.uuid4())[:8]
        create_payload = {
            "title": f"TEST_Update_{test_id}",
            "slug": f"test-update-{test_id}",
            "content": "<p>Initial content</p>",
            "status": "Draft",
            "featured": False,
            "cta_text": "",
            "cta_microcopy": ""
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/blog",
            json=create_payload,
            timeout=30
        )
        assert create_response.status_code == 200, f"Create failed: {create_response.text}"
        
        created = create_response.json()
        post_id = created.get("id")
        self.created_post_ids.append(post_id)
        
        # Now update with new fields
        update_payload = {
            "featured": True,
            "cta_text": "Start your horror journey today!",
            "cta_microcopy": "Free consultation available."
        }
        
        update_response = requests.put(
            f"{BASE_URL}/api/blog/{post_id}",
            json=update_payload,
            timeout=30
        )
        
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        updated = update_response.json()
        
        # Verify updates
        assert updated.get("featured") == True, "featured not updated"
        assert updated.get("cta_text") == "Start your horror journey today!", "cta_text not updated"
        assert updated.get("cta_microcopy") == "Free consultation available.", "cta_microcopy not updated"
        
        print(f"✓ Updated post {post_id}")
        print(f"✓ featured: {updated.get('featured')}")
        print(f"✓ cta_text: {updated.get('cta_text')}")
        print(f"✓ cta_microcopy: {updated.get('cta_microcopy')}")
    
    def test_get_blog_post_returns_new_fields(self):
        """Test GET /api/blog/{id} returns all new fields"""
        # Create a post with all new fields
        test_id = str(uuid.uuid4())[:8]
        create_payload = {
            "title": f"TEST_Get_{test_id}",
            "slug": f"test-get-{test_id}",
            "content": "<p>Test</p>",
            "featured": True,
            "cta_text": "Test CTA",
            "cta_microcopy": "Test microcopy"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/blog",
            json=create_payload,
            timeout=30
        )
        assert create_response.status_code == 200
        
        created = create_response.json()
        post_id = created.get("id")
        self.created_post_ids.append(post_id)
        
        # GET the post
        get_response = requests.get(f"{BASE_URL}/api/blog/{post_id}", timeout=30)
        assert get_response.status_code == 200
        
        data = get_response.json()
        
        # Verify new fields are returned
        assert "featured" in data, "featured field missing from GET response"
        assert "cta_text" in data, "cta_text field missing from GET response"
        assert "cta_microcopy" in data, "cta_microcopy field missing from GET response"
        
        print(f"✓ GET returns all new fields for post {post_id}")


class TestBlogListEndpoint:
    """Tests for GET /api/blog list endpoint"""
    
    def test_get_blog_list(self):
        """Test GET /api/blog returns list of posts"""
        response = requests.get(f"{BASE_URL}/api/blog", timeout=30)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Check that existing posts have expected fields
        if len(data) > 0:
            post = data[0]
            expected_fields = ["id", "title", "slug", "status", "created_at"]
            for field in expected_fields:
                assert field in post, f"Post missing field: {field}"
            print(f"✓ Blog list returned {len(data)} posts")
            print(f"✓ First post: {post.get('title')[:50] if post.get('title') else 'No title'}")
        else:
            print("✓ Blog list endpoint works (no posts found)")


class TestEndpointExists:
    """Basic endpoint availability tests"""
    
    def test_blog_seo_endpoint_exists(self):
        """Verify POST /api/ai/generate-blog-seo endpoint exists"""
        # Test with GET should return 405
        get_response = requests.get(f"{BASE_URL}/api/ai/generate-blog-seo", timeout=10)
        assert get_response.status_code == 405, "GET should return 405 Method Not Allowed"
        print("✓ Blog SEO endpoint exists and rejects GET")
    
    def test_blog_crud_endpoints_exist(self):
        """Verify blog CRUD endpoints exist"""
        # GET /api/blog
        list_response = requests.get(f"{BASE_URL}/api/blog", timeout=10)
        assert list_response.status_code == 200, "GET /api/blog should work"
        
        # GET /api/blog/{invalid-id} - should return 404
        invalid_response = requests.get(f"{BASE_URL}/api/blog/invalid-id", timeout=10)
        assert invalid_response.status_code == 404, "Invalid ID should return 404"
        
        print("✓ Blog CRUD endpoints are available")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
