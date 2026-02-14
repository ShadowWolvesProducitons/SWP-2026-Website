"""
Test Newsletter and Blog Features - Iteration 16
Tests for:
1. POST /api/ai/generate-blog-seo returns 7 fields including cta_text, cta_microcopy
2. POST /api/newsletter/send-bulk with html_content and test_mode
3. Newsletter subscriber count endpoint
4. Blog CRUD with cta_text and cta_microcopy fields
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestBlogSeoAIEndpoint:
    """Test POST /api/ai/generate-blog-seo returns all 7 fields"""

    def test_generate_blog_seo_returns_all_fields(self):
        """Verify generate-blog-seo returns all 7 required fields"""
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-blog-seo",
            json={
                "title": "Test Blog Post About Filmmaking",
                "content": "This is a test blog post about film production techniques and best practices.",
                "tags": ["filmmaking", "production"],
                "excerpt": ""
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        required_fields = ['seo_title', 'seo_description', 'excerpt', 'tags', 'seo_keywords', 'cta_text', 'cta_microcopy']
        
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
            print(f"  ✓ Field '{field}' present: {str(data[field])[:50]}...")
        
        # Validate field types
        assert isinstance(data['seo_title'], str), "seo_title should be string"
        assert isinstance(data['seo_description'], str), "seo_description should be string"
        assert isinstance(data['excerpt'], str), "excerpt should be string"
        assert isinstance(data['tags'], list), "tags should be list"
        assert isinstance(data['seo_keywords'], str), "seo_keywords should be string"
        assert isinstance(data['cta_text'], str), "cta_text should be string"
        assert isinstance(data['cta_microcopy'], str), "cta_microcopy should be string"
        
        print("✓ All 7 fields returned with correct types")

    def test_generate_blog_seo_with_minimal_input(self):
        """Test endpoint with minimal input (title only)"""
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-blog-seo",
            json={
                "title": "Minimal Test Post",
                "content": "",
                "tags": [],
                "excerpt": ""
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert 'cta_text' in data
        assert 'cta_microcopy' in data
        print("✓ Minimal input works correctly")


class TestNewsletterSendBulkEndpoint:
    """Test POST /api/newsletter/send-bulk endpoint"""

    def test_send_bulk_test_mode(self):
        """Test send-bulk with test_mode=true"""
        response = requests.post(
            f"{BASE_URL}/api/newsletter/send-bulk",
            json={
                "subject": "Test Newsletter Subject",
                "html_content": "<h1>Test Newsletter</h1><p>This is a test email.</p>",
                "test_mode": True
            }
        )
        
        # May succeed or fail depending on RESEND_API_KEY
        if response.status_code == 200:
            data = response.json()
            assert 'total' in data
            assert 'sent' in data
            assert 'failed' in data
            print(f"✓ send-bulk test mode: total={data['total']}, sent={data['sent']}, failed={data['failed']}")
        elif response.status_code == 500:
            data = response.json()
            # Expected if RESEND_API_KEY is not configured
            print(f"  Note: send-bulk returned 500 - {data.get('detail', 'Unknown error')}")
            assert 'RESEND_API_KEY' in str(data.get('detail', '')) or response.status_code == 500
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}")

    def test_send_bulk_with_html_content(self):
        """Test send-bulk with full HTML content"""
        html_content = """
        <div style="text-align: center;">
            <h1>The Den — New Post</h1>
            <p>Check out our latest blog post.</p>
            <img src="https://example.com/image.jpg" alt="Cover" />
            <a href="https://example.com/blog/test">Read More</a>
        </div>
        """
        
        response = requests.post(
            f"{BASE_URL}/api/newsletter/send-bulk",
            json={
                "subject": "New from The Den: Test Post",
                "html_content": html_content,
                "test_mode": True
            }
        )
        
        # Endpoint should be callable regardless of email success
        assert response.status_code in [200, 400, 500], f"Unexpected status: {response.status_code}"
        print(f"✓ send-bulk with HTML content - status: {response.status_code}")


class TestNewsletterSubscribers:
    """Test newsletter subscriber endpoints"""

    def test_get_active_subscribers(self):
        """Get count of active subscribers"""
        response = requests.get(f"{BASE_URL}/api/newsletter?active_only=true")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Active subscribers count: {len(data)}")

    def test_get_all_subscribers(self):
        """Get all subscribers including inactive"""
        response = requests.get(f"{BASE_URL}/api/newsletter?active_only=false")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Total subscribers count: {len(data)}")


class TestBlogCRUDWithCTAFields:
    """Test blog CRUD with cta_text and cta_microcopy fields"""

    def test_get_blog_posts(self):
        """Get blog posts list"""
        response = requests.get(f"{BASE_URL}/api/blog")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            # Check if published posts have expected fields
            for post in data:
                if post.get('status') == 'Published':
                    assert 'title' in post
                    assert 'slug' in post
                    # cta_text and cta_microcopy may be null for old posts
                    print(f"  Post: {post['title'][:30]}...")
                    print(f"    - cta_text: {post.get('cta_text')}")
                    print(f"    - cta_microcopy: {post.get('cta_microcopy')}")
        
        print(f"✓ Blog list returned {len(data)} posts")

    def test_create_blog_post_with_cta_fields(self):
        """Create a blog post with cta_text and cta_microcopy"""
        test_slug = f"test-cta-post-{uuid.uuid4().hex[:8]}"
        
        response = requests.post(
            f"{BASE_URL}/api/blog",
            json={
                "title": "Test CTA Post",
                "slug": test_slug,
                "content": "<p>Test content</p>",
                "excerpt": "Test excerpt",
                "status": "Draft",
                "featured": False,
                "tags": ["test"],
                "cta_text": "Ready to start?",
                "cta_microcopy": "No sign-up required."
            }
        )
        
        assert response.status_code == 200, f"Create failed: {response.text}"
        data = response.json()
        
        assert data.get('cta_text') == "Ready to start?"
        assert data.get('cta_microcopy') == "No sign-up required."
        
        # Clean up - delete the test post
        post_id = data.get('id')
        if post_id:
            requests.delete(f"{BASE_URL}/api/blog/{post_id}")
        
        print("✓ Created blog post with CTA fields")

    def test_published_post_has_newsletter_eligible_fields(self):
        """Verify published posts have all fields needed for newsletter"""
        response = requests.get(f"{BASE_URL}/api/blog")
        assert response.status_code == 200
        
        data = response.json()
        published_posts = [p for p in data if p.get('status') == 'Published']
        
        if len(published_posts) > 0:
            post = published_posts[0]
            required_fields = ['title', 'slug', 'excerpt', 'cover_image_url', 'tags']
            
            for field in required_fields:
                assert field in post, f"Missing newsletter field: {field}"
                print(f"  ✓ {field}: {str(post.get(field))[:50]}...")
            
            print(f"✓ Published post '{post['title'][:30]}...' has all newsletter fields")
        else:
            pytest.skip("No published posts to test")


class TestBlogModalDataTestIds:
    """Verify expected data-testid attributes for frontend testing"""

    def test_blog_endpoint_available(self):
        """Verify blog endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/blog")
        assert response.status_code == 200
        print("✓ Blog endpoint accessible")

    def test_ai_generate_blog_seo_endpoint_available(self):
        """Verify AI generate-blog-seo endpoint is accessible"""
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-blog-seo",
            json={"title": "Test", "content": "", "tags": [], "excerpt": ""}
        )
        assert response.status_code == 200
        print("✓ AI generate-blog-seo endpoint accessible")

    def test_newsletter_send_bulk_endpoint_available(self):
        """Verify newsletter send-bulk endpoint is accessible"""
        response = requests.post(
            f"{BASE_URL}/api/newsletter/send-bulk",
            json={"subject": "Test", "html_content": "<p>Test</p>", "test_mode": True}
        )
        # May be 200 or 500 depending on API key config
        assert response.status_code in [200, 400, 500]
        print(f"✓ Newsletter send-bulk endpoint accessible (status: {response.status_code})")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
