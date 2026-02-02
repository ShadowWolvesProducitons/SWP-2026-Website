"""
Backend API tests for Shadow Wolves Productions - New Features
Tests: Submissions, Investor Portal, Newsletter APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSubmissionsAPI:
    """Test Submissions API endpoints"""
    
    def test_create_submission(self):
        """Test creating a new submission"""
        payload = {
            "name": "TEST_API_Submission",
            "email": "test_api@example.com",
            "role": "Writer",
            "submission_type": "Script",
            "genres": ["Horror", "Thriller"],
            "project_stage": "Polished Draft",
            "logline": "A test logline for API testing - a haunted house story.",
            "external_link": "https://example.com/test",
            "message": "Test message from API"
        }
        response = requests.post(f"{BASE_URL}/api/submissions", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert data["role"] == payload["role"]
        assert "id" in data
        print(f"Created submission with ID: {data['id']}")
        return data["id"]
    
    def test_get_submissions(self):
        """Test getting all submissions"""
        response = requests.get(f"{BASE_URL}/api/submissions")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} submissions")
    
    def test_submission_validation_logline_too_long(self):
        """Test validation - logline over 300 chars"""
        payload = {
            "name": "TEST_Validation",
            "email": "test@example.com",
            "role": "Writer",
            "submission_type": "Script",
            "genres": ["Horror"],
            "project_stage": "Idea",
            "logline": "A" * 301,  # Over 300 chars
            "message": ""
        }
        response = requests.post(f"{BASE_URL}/api/submissions", json=payload)
        assert response.status_code == 400, "Should reject logline over 300 chars"


class TestInvestorPortalAPI:
    """Test Investor Portal API endpoints"""
    
    def test_portal_status(self):
        """Test getting portal status"""
        response = requests.get(f"{BASE_URL}/api/investors/portal-status")
        assert response.status_code == 200
        
        data = response.json()
        assert "enabled" in data
        assert "require_code" in data
        print(f"Portal enabled: {data['enabled']}, Require code: {data['require_code']}")
    
    def test_investor_auth_with_password(self):
        """Test investor authentication with password"""
        payload = {"password": "investor2024"}
        response = requests.post(f"{BASE_URL}/api/investors/auth", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["message"] == "Access granted"
        print("Investor auth with password: SUCCESS")
    
    def test_investor_auth_invalid_password(self):
        """Test investor authentication with invalid password"""
        payload = {"password": "wrongpassword"}
        response = requests.post(f"{BASE_URL}/api/investors/auth", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == False
        print("Investor auth with invalid password correctly rejected")
    
    def test_get_investor_projects(self):
        """Test getting investor projects (development slate)"""
        response = requests.get(f"{BASE_URL}/api/investors/projects")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} investor projects")
    
    def test_get_investor_documents(self):
        """Test getting investor documents"""
        response = requests.get(f"{BASE_URL}/api/investors/documents")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} investor documents")
    
    def test_create_investor_inquiry(self):
        """Test creating investor expression of interest"""
        payload = {
            "name": "TEST_API_Investor",
            "email": "test_api_investor@example.com",
            "investor_type": "Individual",
            "area_of_interest": "Single Project",
            "message": "Test inquiry from API"
        }
        response = requests.post(f"{BASE_URL}/api/investors/inquiries", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert "id" in data
        print(f"Created investor inquiry with ID: {data['id']}")


class TestInvestorAdminAPI:
    """Test Investor Admin API endpoints"""
    
    def test_get_admin_settings(self):
        """Test getting admin settings"""
        response = requests.get(f"{BASE_URL}/api/investors/admin/settings")
        assert response.status_code == 200
        
        data = response.json()
        assert "portal_enabled" in data
        assert "global_password" in data
        print(f"Admin settings retrieved: portal_enabled={data['portal_enabled']}")
    
    def test_get_admin_credentials(self):
        """Test getting admin credentials list"""
        response = requests.get(f"{BASE_URL}/api/investors/admin/credentials")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} investor credentials")
    
    def test_get_admin_projects(self):
        """Test getting admin projects list"""
        response = requests.get(f"{BASE_URL}/api/investors/admin/projects")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} admin projects")
    
    def test_get_admin_documents(self):
        """Test getting admin documents list"""
        response = requests.get(f"{BASE_URL}/api/investors/admin/documents")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} admin documents")
    
    def test_get_admin_inquiries(self):
        """Test getting admin inquiries list"""
        response = requests.get(f"{BASE_URL}/api/investors/admin/inquiries")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        # Check if our test inquiry is there
        test_inquiries = [i for i in data if "TEST_" in i.get("name", "")]
        print(f"Found {len(data)} inquiries, {len(test_inquiries)} are test inquiries")


class TestNewsletterAPI:
    """Test Newsletter API endpoints"""
    
    def test_subscribe_newsletter(self):
        """Test subscribing to newsletter"""
        payload = {"email": "test_api_newsletter@example.com"}
        response = requests.post(f"{BASE_URL}/api/newsletter", json=payload)
        
        # Could be 200 (new) or 400 (already subscribed)
        assert response.status_code in [200, 400]
        
        if response.status_code == 200:
            data = response.json()
            assert data["email"] == payload["email"]
            assert data["is_active"] == True
            print(f"Newsletter subscription created for {payload['email']}")
        else:
            print("Email already subscribed (expected if test ran before)")
    
    def test_get_newsletter_subscribers(self):
        """Test getting newsletter subscribers (admin)"""
        response = requests.get(f"{BASE_URL}/api/newsletter")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} newsletter subscribers")
    
    def test_unsubscribe_newsletter(self):
        """Test unsubscribing from newsletter"""
        # First subscribe
        email = "test_unsubscribe@example.com"
        requests.post(f"{BASE_URL}/api/newsletter", json={"email": email})
        
        # Then unsubscribe
        response = requests.delete(f"{BASE_URL}/api/newsletter/{email}")
        assert response.status_code in [200, 404]  # 404 if already unsubscribed
        print(f"Unsubscribe test completed for {email}")


class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_submissions(self):
        """Archive test submissions"""
        response = requests.get(f"{BASE_URL}/api/submissions")
        if response.status_code == 200:
            submissions = response.json()
            test_submissions = [s for s in submissions if "TEST_" in s.get("name", "")]
            for sub in test_submissions:
                requests.delete(f"{BASE_URL}/api/submissions/{sub['id']}")
            print(f"Cleaned up {len(test_submissions)} test submissions")
    
    def test_cleanup_test_inquiries(self):
        """Delete test inquiries"""
        response = requests.get(f"{BASE_URL}/api/investors/admin/inquiries")
        if response.status_code == 200:
            inquiries = response.json()
            test_inquiries = [i for i in inquiries if "TEST_" in i.get("name", "")]
            for inq in test_inquiries:
                requests.delete(f"{BASE_URL}/api/investors/admin/inquiries/{inq['id']}")
            print(f"Cleaned up {len(test_inquiries)} test inquiries")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
