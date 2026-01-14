"""
Backend API Tests for Blog and Armory (Den Items) Features
Tests: Blog CRUD, Den Items filtering, and data persistence
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBlogAPI:
    """Blog API endpoint tests"""
    
    def test_get_all_blog_posts(self):
        """Test fetching all blog posts"""
        response = requests.get(f"{BASE_URL}/api/blog")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/blog - Found {len(data)} posts")
    
    def test_get_published_blog_posts(self):
        """Test fetching only published blog posts"""
        response = requests.get(f"{BASE_URL}/api/blog?status=Published")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned posts should be Published
        for post in data:
            assert post.get('status') == 'Published', f"Post {post.get('title')} is not Published"
        print(f"✓ GET /api/blog?status=Published - Found {len(data)} published posts")
    
    def test_create_blog_post(self):
        """Test creating a new blog post"""
        unique_id = str(uuid.uuid4())[:8]
        post_data = {
            "title": f"TEST_Blog Post {unique_id}",
            "slug": f"test-blog-post-{unique_id}",
            "excerpt": "This is a test excerpt for automated testing",
            "content": "<p>This is <strong>rich text</strong> content with <em>formatting</em>.</p><ul><li>Item 1</li><li>Item 2</li></ul>",
            "tags": ["test", "automation"],
            "status": "Draft"
        }
        
        response = requests.post(f"{BASE_URL}/api/blog", json=post_data)
        assert response.status_code == 200, f"Failed to create post: {response.text}"
        
        created_post = response.json()
        assert created_post['title'] == post_data['title']
        assert created_post['slug'] == post_data['slug']
        assert created_post['content'] == post_data['content']
        assert 'id' in created_post
        
        print(f"✓ POST /api/blog - Created post with ID: {created_post['id']}")
        
        # Store for cleanup
        self.__class__.created_post_id = created_post['id']
        return created_post
    
    def test_get_blog_post_by_id(self):
        """Test fetching a specific blog post by ID"""
        # First create a post
        unique_id = str(uuid.uuid4())[:8]
        post_data = {
            "title": f"TEST_Get By ID {unique_id}",
            "content": "<p>Test content</p>",
            "status": "Draft"
        }
        create_response = requests.post(f"{BASE_URL}/api/blog", json=post_data)
        assert create_response.status_code == 200
        created_post = create_response.json()
        post_id = created_post['id']
        
        # Now fetch by ID
        response = requests.get(f"{BASE_URL}/api/blog/{post_id}")
        assert response.status_code == 200
        
        fetched_post = response.json()
        assert fetched_post['id'] == post_id
        assert fetched_post['title'] == post_data['title']
        
        print(f"✓ GET /api/blog/{post_id} - Fetched post successfully")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/blog/{post_id}?permanent=true")
    
    def test_update_blog_post(self):
        """Test updating a blog post"""
        # First create a post
        unique_id = str(uuid.uuid4())[:8]
        post_data = {
            "title": f"TEST_Update Post {unique_id}",
            "content": "<p>Original content</p>",
            "status": "Draft"
        }
        create_response = requests.post(f"{BASE_URL}/api/blog", json=post_data)
        assert create_response.status_code == 200
        created_post = create_response.json()
        post_id = created_post['id']
        
        # Update the post
        update_data = {
            "title": f"TEST_Updated Title {unique_id}",
            "content": "<p>Updated <strong>content</strong></p>",
            "status": "Published"
        }
        update_response = requests.put(f"{BASE_URL}/api/blog/{post_id}", json=update_data)
        assert update_response.status_code == 200
        
        updated_post = update_response.json()
        assert updated_post['title'] == update_data['title']
        assert updated_post['content'] == update_data['content']
        assert updated_post['status'] == 'Published'
        assert updated_post.get('published_at') is not None  # Should be set when publishing
        
        print(f"✓ PUT /api/blog/{post_id} - Updated post successfully")
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/blog/{post_id}")
        assert get_response.status_code == 200
        fetched_post = get_response.json()
        assert fetched_post['title'] == update_data['title']
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/blog/{post_id}?permanent=true")
    
    def test_delete_blog_post_archive(self):
        """Test archiving (soft delete) a blog post"""
        # First create a post
        unique_id = str(uuid.uuid4())[:8]
        post_data = {
            "title": f"TEST_Archive Post {unique_id}",
            "content": "<p>To be archived</p>",
            "status": "Draft"
        }
        create_response = requests.post(f"{BASE_URL}/api/blog", json=post_data)
        assert create_response.status_code == 200
        created_post = create_response.json()
        post_id = created_post['id']
        
        # Archive the post (soft delete)
        delete_response = requests.delete(f"{BASE_URL}/api/blog/{post_id}")
        assert delete_response.status_code == 200
        
        result = delete_response.json()
        assert 'archived' in result.get('message', '').lower()
        
        print(f"✓ DELETE /api/blog/{post_id} - Archived post successfully")
        
        # Permanent cleanup
        requests.delete(f"{BASE_URL}/api/blog/{post_id}?permanent=true")
    
    def test_get_blog_post_by_slug(self):
        """Test fetching a published blog post by slug"""
        # First create and publish a post
        unique_id = str(uuid.uuid4())[:8]
        slug = f"test-slug-{unique_id}"
        post_data = {
            "title": f"TEST_Slug Post {unique_id}",
            "slug": slug,
            "content": "<p>Content for slug test</p>",
            "status": "Published"
        }
        create_response = requests.post(f"{BASE_URL}/api/blog", json=post_data)
        assert create_response.status_code == 200
        created_post = create_response.json()
        post_id = created_post['id']
        
        # Fetch by slug
        response = requests.get(f"{BASE_URL}/api/blog/slug/{slug}")
        assert response.status_code == 200
        
        fetched_post = response.json()
        assert fetched_post['slug'] == slug
        assert fetched_post['title'] == post_data['title']
        
        print(f"✓ GET /api/blog/slug/{slug} - Fetched post by slug successfully")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/blog/{post_id}?permanent=true")
    
    def test_blog_post_not_found(self):
        """Test 404 for non-existent blog post"""
        response = requests.get(f"{BASE_URL}/api/blog/non-existent-id-12345")
        assert response.status_code == 404
        print("✓ GET /api/blog/non-existent-id - Returns 404 as expected")


class TestDenItemsAPI:
    """Den Items (Armory) API endpoint tests"""
    
    def test_get_apps(self):
        """Test fetching Apps items"""
        response = requests.get(f"{BASE_URL}/api/den-items?item_type=Apps")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Verify all items are Apps type
        for item in data:
            assert item.get('item_type') == 'Apps'
        
        print(f"✓ GET /api/den-items?item_type=Apps - Found {len(data)} apps")
    
    def test_get_templates(self):
        """Test fetching Templates items"""
        response = requests.get(f"{BASE_URL}/api/den-items?item_type=Templates")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/den-items?item_type=Templates - Found {len(data)} templates")
    
    def test_get_downloads(self):
        """Test fetching Downloads items"""
        response = requests.get(f"{BASE_URL}/api/den-items?item_type=Downloads")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/den-items?item_type=Downloads - Found {len(data)} downloads")
    
    def test_get_courses(self):
        """Test fetching Courses items"""
        response = requests.get(f"{BASE_URL}/api/den-items?item_type=Courses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/den-items?item_type=Courses - Found {len(data)} courses")
    
    def test_get_ebooks(self):
        """Test fetching eBooks items"""
        response = requests.get(f"{BASE_URL}/api/den-items?item_type=eBooks")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/den-items?item_type=eBooks - Found {len(data)} ebooks")
    
    def test_den_item_structure(self):
        """Test that den items have required fields"""
        response = requests.get(f"{BASE_URL}/api/den-items?item_type=Apps")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            item = data[0]
            # Check required fields exist
            required_fields = ['id', 'title', 'item_type']
            for field in required_fields:
                assert field in item, f"Missing required field: {field}"
            
            # Check optional fields structure
            optional_fields = ['short_description', 'thumbnail_url', 'price', 'is_free', 'featured', 'tags']
            for field in optional_fields:
                if field in item:
                    print(f"  - {field}: {type(item[field]).__name__}")
            
            print(f"✓ Den item structure validated - Item: {item['title']}")
        else:
            print("⚠ No Apps items to validate structure")


class TestAdminLogin:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test successful admin login"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "password": "shadowwolves2024"
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get('success') == True
        print("✓ POST /api/admin/login - Login successful")
    
    def test_admin_login_failure(self):
        """Test failed admin login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ POST /api/admin/login - Wrong password returns 401")


# Cleanup fixture
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    """Cleanup TEST_ prefixed data after all tests"""
    yield
    # Cleanup: Delete all test-created blog posts
    try:
        response = requests.get(f"{BASE_URL}/api/blog")
        if response.status_code == 200:
            posts = response.json()
            for post in posts:
                if post.get('title', '').startswith('TEST_'):
                    requests.delete(f"{BASE_URL}/api/blog/{post['id']}?permanent=true")
                    print(f"Cleaned up test post: {post['title']}")
    except Exception as e:
        print(f"Cleanup error: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
