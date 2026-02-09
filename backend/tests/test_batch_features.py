"""
Test suite for Shadow Wolves Productions - Batch Features #4-#11
Testing CineConnect, Activity Tab, Investor Blog, back buttons, hidden admin link
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCineConnectInterest:
    """Test #4 - CineConnect Register Interest feature"""
    
    def test_register_cineconnect_interest_success(self):
        """POST /api/contact/cineconnect-interest - Register interest"""
        response = requests.post(
            f"{BASE_URL}/api/contact/cineconnect-interest",
            json={
                "name": "TEST_CineConnect User",
                "email": "test_cineconnect@example.com"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "message" in data
        assert data["message"] == "Interest registered successfully"
    
    def test_get_cineconnect_interests(self):
        """GET /api/contact/cineconnect-interest - Get all interests (admin)"""
        response = requests.get(f"{BASE_URL}/api/contact/cineconnect-interest")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        # Should have at least one entry (from previous test)
        print(f"Found {len(data)} CineConnect interests")


class TestAdminActivityTab:
    """Test #9 - Admin Activity Tab merging Messages/Submissions/CineConnect"""
    
    def test_get_contact_messages(self):
        """GET /api/contact - Get messages for Activity tab"""
        response = requests.get(f"{BASE_URL}/api/contact")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} contact messages")
    
    def test_get_submissions(self):
        """GET /api/submissions - Get submissions for Activity tab"""
        response = requests.get(f"{BASE_URL}/api/submissions")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} submissions")
    
    def test_create_and_update_message_status(self):
        """Test status update for Activity tab"""
        # First create a message
        create_response = requests.post(
            f"{BASE_URL}/api/contact",
            json={
                "name": "TEST_Activity User",
                "email": "test_activity@example.com",
                "phone": "123-456-7890",
                "service": "film-production",
                "message": "Test message for activity tab testing"
            }
        )
        assert create_response.status_code == 200, f"Create failed: {create_response.text}"
        message = create_response.json()
        message_id = message.get("id")
        
        # Update status to 'Read'
        update_response = requests.put(
            f"{BASE_URL}/api/contact/{message_id}",
            json={"status": "Read"}
        )
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        updated = update_response.json()
        assert updated["status"] == "Read"
        
        # Update status to 'Replied'
        update_response2 = requests.put(
            f"{BASE_URL}/api/contact/{message_id}",
            json={"status": "Replied"}
        )
        assert update_response2.status_code == 200
        assert update_response2.json()["status"] == "Replied"


class TestInvestorBlog:
    """Test #10 - Investor Private Blog"""
    
    def test_get_blog_posts_public(self):
        """GET /api/investors/blog/posts - Get published posts"""
        response = requests.get(f"{BASE_URL}/api/investors/blog/posts")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} published blog posts")
        # Check if test post exists
        for post in data:
            if "Q1 2026" in post.get("title", ""):
                print(f"Found test blog post: {post['title']}")
    
    def test_get_blog_posts_all(self):
        """GET /api/investors/blog/posts?published_only=false - Get all posts (admin)"""
        response = requests.get(f"{BASE_URL}/api/investors/blog/posts?published_only=false")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} total blog posts (including drafts)")
    
    def test_create_update_delete_blog_post(self):
        """Full CRUD for investor blog post"""
        # Create
        create_response = requests.post(
            f"{BASE_URL}/api/investors/blog/posts",
            json={
                "title": "TEST_Blog Post",
                "content": "<p>Test content for investor blog</p>",
                "summary": "Test summary",
                "category": "Update",
                "is_published": False
            }
        )
        assert create_response.status_code == 200, f"Create failed: {create_response.text}"
        post = create_response.json()
        assert post["title"] == "TEST_Blog Post"
        assert "id" in post
        post_id = post["id"]
        
        # Update
        update_response = requests.put(
            f"{BASE_URL}/api/investors/blog/posts/{post_id}",
            json={
                "title": "TEST_Blog Post Updated",
                "content": "<p>Updated content</p>",
                "summary": "Updated summary",
                "category": "Milestone",
                "is_published": True
            }
        )
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        # Verify update
        get_response = requests.get(f"{BASE_URL}/api/investors/blog/posts?published_only=false")
        assert get_response.status_code == 200
        posts = get_response.json()
        updated_post = next((p for p in posts if p.get("id") == post_id), None)
        assert updated_post is not None, "Post not found after update"
        assert updated_post["title"] == "TEST_Blog Post Updated"
        assert updated_post["category"] == "Milestone"
        
        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/investors/blog/posts/{post_id}")
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.text}"


class TestInvestorPortalBlogEndpoints:
    """Additional investor blog tests"""
    
    def test_investor_portal_status(self):
        """GET /api/investors/portal-status - Check portal is enabled"""
        response = requests.get(f"{BASE_URL}/api/investors/portal-status")
        assert response.status_code == 200
        data = response.json()
        assert "enabled" in data
        print(f"Portal enabled: {data['enabled']}")
    
    def test_investor_projects(self):
        """GET /api/investors/projects - Get development slate"""
        response = requests.get(f"{BASE_URL}/api/investors/projects")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} investor projects")


class TestDenItemsCanonicalTemplate:
    """Test #6 - Canonical app landing page template fields"""
    
    def test_get_den_items(self):
        """GET /api/den-items - Get all products"""
        response = requests.get(f"{BASE_URL}/api/den-items")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} den items")
    
    def test_get_den_item_by_slug(self):
        """GET /api/den-items/by-slug/{slug} - Get product by slug"""
        # First get all items
        all_response = requests.get(f"{BASE_URL}/api/den-items")
        if all_response.status_code == 200:
            items = all_response.json()
            if items:
                # Try to get first item with a slug
                for item in items:
                    if item.get("slug"):
                        slug = item["slug"]
                        response = requests.get(f"{BASE_URL}/api/den-items/by-slug/{slug}")
                        assert response.status_code == 200, f"Expected 200 for slug {slug}, got {response.status_code}"
                        data = response.json()
                        assert data["slug"] == slug
                        print(f"Successfully fetched product: {data['title']}")
                        # Check canonical fields exist
                        canonical_fields = ["what_it_is", "core_actions", "experiences", 
                                          "how_it_works", "what_its_not", "final_cta_text"]
                        for field in canonical_fields:
                            if field in data:
                                print(f"  - Has {field}")
                        break
                else:
                    pytest.skip("No items with slugs found")
    
    def test_create_item_with_canonical_fields(self):
        """POST /api/den-items - Create with canonical template fields"""
        create_response = requests.post(
            f"{BASE_URL}/api/den-items",
            json={
                "title": "TEST_Canonical App",
                "slug": "test-canonical-app",
                "item_type": "Apps",
                "short_description": "Test app for canonical template",
                "what_it_is": "Test app turns testing into validation. Built for QA engineers.",
                "core_actions": ["Create test", "Run test", "View results"],
                "experiences": ["Real-time feedback", "Detailed reports"],
                "how_it_works": ["Step 1: Setup", "Step 2: Execute", "Step 3: Review"],
                "how_it_works_notes": "Each step takes about 2 minutes.",
                "what_its_not": ["Not a replacement for manual testing", "No AI features"],
                "what_its_not_closing": "Just focused testing and clear results.",
                "final_cta_text": "TEST_Canonical App is ready when you are.",
                "final_cta_microcopy": "No subscriptions · No lock-in",
                "price_status": "Free",
                "features": ["Feature 1", "Feature 2"],
                "tags": ["testing", "qa"],
                "is_free": True,
                "is_published": True
            }
        )
        assert create_response.status_code == 200, f"Create failed: {create_response.text}"
        item = create_response.json()
        assert item["title"] == "TEST_Canonical App"
        assert item["what_it_is"] == "Test app turns testing into validation. Built for QA engineers."
        assert len(item["core_actions"]) == 3
        
        item_id = item["id"]
        
        # Verify by slug
        get_response = requests.get(f"{BASE_URL}/api/den-items/by-slug/test-canonical-app")
        assert get_response.status_code == 200
        
        # Clean up
        delete_response = requests.delete(f"{BASE_URL}/api/den-items/{item_id}?permanent=true")
        assert delete_response.status_code == 200


class TestContactAndSubmissionsEndpoints:
    """Test contact and submissions endpoints for Activity tab data"""
    
    def test_contact_message_crud(self):
        """Full CRUD for contact messages"""
        # Create
        create_response = requests.post(
            f"{BASE_URL}/api/contact",
            json={
                "name": "TEST_Contact",
                "email": "test_contact@example.com",
                "phone": "555-1234",
                "service": "post-production",
                "message": "Test contact message"
            }
        )
        assert create_response.status_code == 200
        msg = create_response.json()
        msg_id = msg["id"]
        
        # Get single
        get_response = requests.get(f"{BASE_URL}/api/contact/{msg_id}")
        assert get_response.status_code == 200
        
        # Archive (soft delete)
        archive_response = requests.delete(f"{BASE_URL}/api/contact/{msg_id}")
        assert archive_response.status_code == 200
        
        # Verify archived
        get_response2 = requests.get(f"{BASE_URL}/api/contact/{msg_id}")
        assert get_response2.status_code == 200
        assert get_response2.json()["status"] == "Archived"
        
        # Permanent delete
        perm_delete = requests.delete(f"{BASE_URL}/api/contact/{msg_id}?permanent=true")
        assert perm_delete.status_code == 200


class TestHealthAndBasicEndpoints:
    """Basic health checks"""
    
    def test_api_health(self):
        """GET /api - Health check"""
        response = requests.get(f"{BASE_URL}/api")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print(f"API health: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
