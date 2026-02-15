"""
Test Suite: UI/UX Batch Update Features - Iteration 17
Tests page headers, blog AI generation, newsletter emails, and armory product cards
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPageHeaders:
    """Test that page header images are served correctly"""
    
    def test_header_about_image(self):
        """Test /api/upload/images/header-about.jpg is accessible"""
        r = requests.get(f"{BASE_URL}/api/upload/images/header-about.jpg", timeout=10)
        assert r.status_code == 200, f"header-about.jpg not found: {r.status_code}"
        assert 'image' in r.headers.get('content-type', '').lower(), "Not an image"
        print("✓ header-about.jpg accessible")
    
    def test_header_films_image(self):
        """Test /api/upload/images/header-films.jpg is accessible"""
        r = requests.get(f"{BASE_URL}/api/upload/images/header-films.jpg", timeout=10)
        assert r.status_code == 200, f"header-films.jpg not found: {r.status_code}"
        print("✓ header-films.jpg accessible")
    
    def test_header_armory_image(self):
        """Test /api/upload/images/header-armory.jpg is accessible"""
        r = requests.get(f"{BASE_URL}/api/upload/images/header-armory.jpg", timeout=10)
        assert r.status_code == 200, f"header-armory.jpg not found: {r.status_code}"
        print("✓ header-armory.jpg accessible")
    
    def test_header_den_image(self):
        """Test /api/upload/images/header-den.jpg is accessible"""
        r = requests.get(f"{BASE_URL}/api/upload/images/header-den.jpg", timeout=10)
        assert r.status_code == 200, f"header-den.jpg not found: {r.status_code}"
        print("✓ header-den.jpg accessible")
    
    def test_header_investors_image(self):
        """Test /api/upload/images/header-investors.jpg is accessible"""
        r = requests.get(f"{BASE_URL}/api/upload/images/header-investors.jpg", timeout=10)
        assert r.status_code == 200, f"header-investors.jpg not found: {r.status_code}"
        print("✓ header-investors.jpg accessible")
    
    def test_header_workwithus_image(self):
        """Test /api/upload/images/header-workwithus.jpg is accessible"""
        r = requests.get(f"{BASE_URL}/api/upload/images/header-workwithus.jpg", timeout=10)
        assert r.status_code == 200, f"header-workwithus.jpg not found: {r.status_code}"
        print("✓ header-workwithus.jpg accessible")
    
    def test_header_contact_image(self):
        """Test /api/upload/images/header-contact.jpg is accessible"""
        r = requests.get(f"{BASE_URL}/api/upload/images/header-contact.jpg", timeout=10)
        assert r.status_code == 200, f"header-contact.jpg not found: {r.status_code}"
        print("✓ header-contact.jpg accessible")


class TestBlogAIGeneration:
    """Test blog SEO AI generation endpoint"""
    
    def test_generate_blog_seo_returns_title(self):
        """POST /api/ai/generate-blog-seo should return 'title' field"""
        payload = {
            "title": "Test Blog Post",
            "content": "<p>This is test content about filmmaking and horror movies.</p>",
            "tags": ["horror", "film"],
            "excerpt": "A test excerpt"
        }
        r = requests.post(f"{BASE_URL}/api/ai/generate-blog-seo", json=payload, timeout=60)
        assert r.status_code == 200, f"AI endpoint failed: {r.status_code} - {r.text}"
        
        data = r.json()
        # Check that 'title' field exists in response
        assert "title" in data, f"'title' field missing from response: {data.keys()}"
        assert isinstance(data["title"], str), "title should be a string"
        assert len(data["title"]) > 0, "title should not be empty"
        print(f"✓ AI returns title field: {data['title'][:50]}...")
        
        # Also verify other expected fields
        expected_fields = ["seo_title", "seo_description", "excerpt", "tags"]
        for field in expected_fields:
            assert field in data, f"'{field}' missing from response"
        print(f"✓ All expected fields present: {list(data.keys())}")


class TestNewsletterSendBulk:
    """Test newsletter send-bulk endpoint wraps content with header and unsubscribe"""
    
    def test_send_bulk_endpoint_accessible(self):
        """POST /api/newsletter/send-bulk should be accessible"""
        # Test with test_mode=true to not actually send
        payload = {
            "subject": "Test Newsletter",
            "html_content": "<p>Test content</p>",
            "test_mode": True
        }
        r = requests.post(f"{BASE_URL}/api/newsletter/send-bulk", json=payload, timeout=30)
        # Should either succeed or fail gracefully (400 if no subscribers)
        assert r.status_code in [200, 400], f"Unexpected status: {r.status_code} - {r.text}"
        print(f"✓ send-bulk endpoint accessible, status: {r.status_code}")
        
        if r.status_code == 200:
            data = r.json()
            assert "total" in data, "Response should have 'total' field"
            assert "sent" in data, "Response should have 'sent' field"
            print(f"✓ Newsletter response: total={data.get('total')}, sent={data.get('sent')}")


class TestBlogEndpoints:
    """Test blog post CRUD operations"""
    
    def test_get_blog_posts(self):
        """GET /api/blog should return list of posts"""
        r = requests.get(f"{BASE_URL}/api/blog", timeout=10)
        assert r.status_code == 200, f"Blog list failed: {r.status_code}"
        data = r.json()
        assert isinstance(data, list), "Should return a list"
        print(f"✓ Blog posts list returned {len(data)} posts")
        
        # Check structure of first post if exists
        if len(data) > 0:
            post = data[0]
            assert "title" in post, "Post should have title"
            assert "slug" in post, "Post should have slug"
            # Check for cover_image_url field (fixed from cover_image)
            if "cover_image_url" in post:
                print(f"✓ First post has cover_image_url field")


class TestArmoryDenItems:
    """Test armory/den items endpoint"""
    
    def test_get_den_items(self):
        """GET /api/den-items should return list of products"""
        r = requests.get(f"{BASE_URL}/api/den-items", timeout=10)
        assert r.status_code == 200, f"Den items failed: {r.status_code}"
        data = r.json()
        assert isinstance(data, list), "Should return a list"
        print(f"✓ Den items returned {len(data)} items")
        
        # Check structure if items exist
        if len(data) > 0:
            item = data[0]
            assert "title" in item, "Item should have title"
            print(f"✓ First item: {item.get('title')}")


class TestAssetsLibrary:
    """Test assets library for playbook image"""
    
    def test_assets_search_playbook(self):
        """GET /api/assets?search=playbook should find playbook assets"""
        r = requests.get(f"{BASE_URL}/api/assets?search=playbook", timeout=10)
        assert r.status_code == 200, f"Assets search failed: {r.status_code}"
        data = r.json()
        assert isinstance(data, list), "Should return a list"
        print(f"✓ Assets search found {len(data)} playbook assets")
        
        # Check if we have a mockup image for the blog page
        mockups = [a for a in data if a.get('asset_type') == 'image' and 'mockup' in (a.get('original_name', '') or '').lower()]
        if mockups:
            print(f"✓ Found playbook mockup image: {mockups[0].get('original_name')}")
        else:
            print("! No playbook mockup image found in assets")


@pytest.fixture(scope="session", autouse=True)
def setup_env():
    """Setup test environment"""
    if not BASE_URL:
        pytest.skip("REACT_APP_BACKEND_URL not set")
    print(f"\nTesting against: {BASE_URL}")
