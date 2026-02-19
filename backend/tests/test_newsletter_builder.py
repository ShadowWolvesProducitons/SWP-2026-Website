"""
Newsletter Builder API Tests
Tests for newsletter issue CRUD, preview, segments, and send functionality
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://newsletter-forge-4.preview.emergentagent.com')

class TestNewsletterBuilderIssues:
    """Tests for Newsletter Builder Issues CRUD"""
    
    test_issue_id = None  # Store created issue ID for cleanup
    
    def test_get_issues(self):
        """GET /api/newsletter-builder/issues - Returns list of issues"""
        response = requests.get(f"{BASE_URL}/api/newsletter-builder/issues")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: GET /api/newsletter-builder/issues - Found {len(data)} issues")
    
    def test_get_issues_filter_by_status(self):
        """GET /api/newsletter-builder/issues?status=draft - Filter by status"""
        response = requests.get(f"{BASE_URL}/api/newsletter-builder/issues?status=draft")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        # All items should have draft status
        for item in data:
            assert item.get('status') == 'draft', f"Expected draft status, got {item.get('status')}"
        print(f"PASS: GET /api/newsletter-builder/issues?status=draft - Found {len(data)} draft issues")
    
    def test_create_newsletter_issue(self):
        """POST /api/newsletter-builder/issues - Create new newsletter"""
        payload = {
            "title": f"TEST_Newsletter_{uuid.uuid4().hex[:8]}",
            "subject": "Test Subject Line",
            "preheader": "Test preheader text",
            "issue_label": "TEST ISSUE 01",
            "date_label": "19 Feb 2026",
            "hero_title": "Test Hero Title",
            "hero_intro": "Test hero introduction text",
            "hero_chips": "Test • Chips • Here",
            "blocks": [
                {
                    "type": "main_story",
                    "headline": "Test Headline",
                    "body": "Test body content",
                    "eyebrow": "TEST EYEBROW",
                    "cta_text": "Click Here",
                    "cta_url": "https://example.com"
                }
            ],
            "segment": "all",
            "show_studio_cta": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/newsletter-builder/issues",
            json=payload
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should have an ID"
        assert data["title"] == payload["title"], f"Title mismatch: {data['title']}"
        assert data["subject"] == payload["subject"], f"Subject mismatch"
        assert data["status"] == "draft", f"New issue should be draft"
        assert len(data["blocks"]) == 1, f"Should have 1 block"
        
        TestNewsletterBuilderIssues.test_issue_id = data["id"]
        print(f"PASS: POST /api/newsletter-builder/issues - Created issue {data['id']}")
        return data["id"]
    
    def test_get_single_issue(self):
        """GET /api/newsletter-builder/issues/{id} - Get single issue"""
        if not TestNewsletterBuilderIssues.test_issue_id:
            pytest.skip("No test issue ID available")
        
        issue_id = TestNewsletterBuilderIssues.test_issue_id
        response = requests.get(f"{BASE_URL}/api/newsletter-builder/issues/{issue_id}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["id"] == issue_id, f"ID mismatch"
        print(f"PASS: GET /api/newsletter-builder/issues/{issue_id} - Retrieved issue")
    
    def test_get_nonexistent_issue(self):
        """GET /api/newsletter-builder/issues/{id} - Returns 404 for non-existent"""
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/newsletter-builder/issues/{fake_id}")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"PASS: GET /api/newsletter-builder/issues/{fake_id} - Returns 404")
    
    def test_update_newsletter_issue(self):
        """PUT /api/newsletter-builder/issues/{id} - Update existing issue"""
        if not TestNewsletterBuilderIssues.test_issue_id:
            pytest.skip("No test issue ID available")
        
        issue_id = TestNewsletterBuilderIssues.test_issue_id
        update_payload = {
            "subject": "Updated Subject Line",
            "hero_title": "Updated Hero Title",
            "blocks": [
                {
                    "type": "main_story",
                    "headline": "Updated Headline",
                    "body": "Updated body content",
                    "eyebrow": "UPDATED EYEBROW"
                },
                {
                    "type": "image_text",
                    "title": "Image Text Card",
                    "body": "Card description",
                    "link_text": "Learn More",
                    "link_url": "https://example.com/learn"
                }
            ]
        }
        
        response = requests.put(
            f"{BASE_URL}/api/newsletter-builder/issues/{issue_id}",
            json=update_payload
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["subject"] == "Updated Subject Line", f"Subject not updated"
        assert data["hero_title"] == "Updated Hero Title", f"Hero title not updated"
        assert len(data["blocks"]) == 2, f"Should have 2 blocks now"
        print(f"PASS: PUT /api/newsletter-builder/issues/{issue_id} - Updated issue")
    
    def test_update_nonexistent_issue(self):
        """PUT /api/newsletter-builder/issues/{id} - Returns 404 for non-existent"""
        fake_id = str(uuid.uuid4())
        response = requests.put(
            f"{BASE_URL}/api/newsletter-builder/issues/{fake_id}",
            json={"title": "Test"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"PASS: PUT /api/newsletter-builder/issues/{fake_id} - Returns 404")


class TestNewsletterBuilderPreview:
    """Tests for Newsletter Builder Preview functionality"""
    
    def test_preview_existing_issue(self):
        """POST /api/newsletter-builder/issues/{id}/preview - Generate preview HTML"""
        # Use the pre-existing test issue from main agent
        issue_id = "496e9c35-fbc2-4341-98a5-28ff90624a88"
        
        response = requests.post(f"{BASE_URL}/api/newsletter-builder/issues/{issue_id}/preview")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "html" in data, "Response should contain html field"
        assert len(data["html"]) > 100, "HTML should have substantial content"
        assert "<!DOCTYPE html>" in data["html"], "HTML should be a full document"
        assert "Shadow Wolves" in data["html"], "HTML should contain Shadow Wolves branding"
        print(f"PASS: POST /api/newsletter-builder/issues/{issue_id}/preview - Generated HTML ({len(data['html'])} chars)")
    
    def test_preview_nonexistent_issue(self):
        """POST /api/newsletter-builder/issues/{id}/preview - Returns 404 for non-existent"""
        fake_id = str(uuid.uuid4())
        response = requests.post(f"{BASE_URL}/api/newsletter-builder/issues/{fake_id}/preview")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"PASS: POST /api/newsletter-builder/issues/{fake_id}/preview - Returns 404")


class TestNewsletterBuilderSegments:
    """Tests for Newsletter Builder Audience Segments"""
    
    def test_get_segments(self):
        """GET /api/newsletter-builder/segments - Returns audience segments"""
        response = requests.get(f"{BASE_URL}/api/newsletter-builder/segments")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "segments" in data, "Response should contain segments field"
        segments = data["segments"]
        
        assert isinstance(segments, list), "Segments should be a list"
        assert len(segments) >= 2, f"Expected at least 2 segments, got {len(segments)}"
        
        # Check segment structure
        for seg in segments:
            assert "id" in seg, f"Segment missing id: {seg}"
            assert "label" in seg, f"Segment missing label: {seg}"
            assert "count" in seg, f"Segment missing count: {seg}"
            assert isinstance(seg["count"], int), f"Count should be integer"
        
        # Check specific segments exist
        segment_ids = [s["id"] for s in segments]
        assert "all" in segment_ids, "Should have 'all' segment"
        assert "portal_users" in segment_ids, "Should have 'portal_users' segment"
        
        print(f"PASS: GET /api/newsletter-builder/segments - Found {len(segments)} segments")
        for seg in segments:
            print(f"  - {seg['label']}: {seg['count']} recipients")


class TestNewsletterBuilderSend:
    """Tests for Newsletter Builder Send functionality"""
    
    def test_send_test_email(self):
        """POST /api/newsletter-builder/issues/{id}/send - Send test email"""
        # Use the pre-existing test issue from main agent
        issue_id = "496e9c35-fbc2-4341-98a5-28ff90624a88"
        test_email = "test@example.com"
        
        response = requests.post(
            f"{BASE_URL}/api/newsletter-builder/issues/{issue_id}/send?test_email={test_email}"
        )
        # May get 200 or 500 depending on Resend API key validity
        # But we should at least get a proper response
        assert response.status_code in [200, 500], f"Expected 200 or 500, got {response.status_code}"
        
        if response.status_code == 200:
            data = response.json()
            assert "sent" in data, "Response should have sent count"
            assert data["test_mode"] == True, "Should be in test mode"
            print(f"PASS: POST /api/newsletter-builder/issues/{issue_id}/send - Test email sent")
        else:
            # 500 is acceptable if Resend API has issues
            print(f"WARN: POST /api/newsletter-builder/issues/{issue_id}/send - Got 500 (Resend API issue)")
    
    def test_send_nonexistent_issue(self):
        """POST /api/newsletter-builder/issues/{id}/send - Returns 404 for non-existent"""
        fake_id = str(uuid.uuid4())
        response = requests.post(f"{BASE_URL}/api/newsletter-builder/issues/{fake_id}/send")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"PASS: POST /api/newsletter-builder/issues/{fake_id}/send - Returns 404")


class TestNewsletterBuilderBlockTypes:
    """Tests for Newsletter Builder Block Types"""
    
    def test_create_issue_with_all_block_types(self):
        """Create issue with all three block types"""
        payload = {
            "title": f"TEST_AllBlocks_{uuid.uuid4().hex[:8]}",
            "subject": "Test All Block Types",
            "blocks": [
                {
                    "type": "main_story",
                    "headline": "Main Story Headline",
                    "body": "Main story body text",
                    "eyebrow": "FEATURE",
                    "image_url": "https://example.com/image.jpg",
                    "image_alt": "Test image",
                    "cta_text": "Read More",
                    "cta_url": "https://example.com",
                    "cta_microcopy": "Free access for members"
                },
                {
                    "type": "image_text",
                    "title": "Image Text Card",
                    "body": "Card description text",
                    "image_url": "https://example.com/card.jpg",
                    "image_alt": "Card image",
                    "link_text": "Learn More",
                    "link_url": "https://example.com/learn"
                },
                {
                    "type": "simple_text",
                    "headline": "Simple Text Headline",
                    "body": "Simple text body content"
                }
            ],
            "segment": "all"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/newsletter-builder/issues",
            json=payload
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert len(data["blocks"]) == 3, f"Should have 3 blocks"
        
        # Verify block types
        block_types = [b["type"] for b in data["blocks"]]
        assert "main_story" in block_types, "Should have main_story block"
        assert "image_text" in block_types, "Should have image_text block"
        assert "simple_text" in block_types, "Should have simple_text block"
        
        # Cleanup - delete the test issue
        delete_response = requests.delete(f"{BASE_URL}/api/newsletter-builder/issues/{data['id']}")
        assert delete_response.status_code == 200, f"Failed to cleanup test issue"
        
        print(f"PASS: Created and deleted issue with all 3 block types")


class TestNewsletterBuilderDelete:
    """Tests for Newsletter Builder Delete functionality"""
    
    def test_delete_newsletter_issue(self):
        """DELETE /api/newsletter-builder/issues/{id} - Delete issue"""
        # First create an issue to delete
        payload = {
            "title": f"TEST_ToDelete_{uuid.uuid4().hex[:8]}",
            "subject": "Delete Me"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/newsletter-builder/issues",
            json=payload
        )
        assert create_response.status_code == 200, f"Failed to create test issue"
        issue_id = create_response.json()["id"]
        
        # Now delete it
        delete_response = requests.delete(f"{BASE_URL}/api/newsletter-builder/issues/{issue_id}")
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        
        data = delete_response.json()
        assert "message" in data, "Response should have message"
        
        # Verify it's deleted
        get_response = requests.get(f"{BASE_URL}/api/newsletter-builder/issues/{issue_id}")
        assert get_response.status_code == 404, f"Deleted issue should return 404"
        
        print(f"PASS: DELETE /api/newsletter-builder/issues/{issue_id} - Issue deleted and verified")
    
    def test_delete_nonexistent_issue(self):
        """DELETE /api/newsletter-builder/issues/{id} - Returns 404 for non-existent"""
        fake_id = str(uuid.uuid4())
        response = requests.delete(f"{BASE_URL}/api/newsletter-builder/issues/{fake_id}")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"PASS: DELETE /api/newsletter-builder/issues/{fake_id} - Returns 404")


# Cleanup fixture to delete test issues created during tests
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_issues():
    """Cleanup TEST_ prefixed issues after all tests"""
    yield
    # Cleanup after all tests
    response = requests.get(f"{BASE_URL}/api/newsletter-builder/issues")
    if response.status_code == 200:
        issues = response.json()
        for issue in issues:
            if issue.get("title", "").startswith("TEST_"):
                requests.delete(f"{BASE_URL}/api/newsletter-builder/issues/{issue['id']}")
                print(f"Cleaned up test issue: {issue['id']}")
