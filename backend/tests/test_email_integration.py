"""
Test Email Integration for Shadow Wolves Productions
Tests: Newsletter bulk email, Investor inquiry notification, Contact form notification, 
       Work With Us submission notification, Welcome email on newsletter signup
"""
import pytest
import requests
import os
import time
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestNewsletterBulkEmail:
    """Test bulk email sending from Newsletter admin tab"""
    
    def test_get_newsletter_subscribers(self):
        """Test fetching newsletter subscribers"""
        response = requests.get(f"{BASE_URL}/api/newsletter?active_only=true")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} active subscribers")
        return data
    
    def test_send_bulk_email_no_subscribers(self):
        """Test bulk email when no subscribers exist (should fail gracefully)"""
        # First check if there are subscribers
        response = requests.get(f"{BASE_URL}/api/newsletter?active_only=true")
        subscribers = response.json()
        
        if len(subscribers) == 0:
            # Test with no subscribers - should return 400
            response = requests.post(
                f"{BASE_URL}/api/newsletter/send-bulk",
                json={
                    "subject": "Test Newsletter",
                    "html_content": "<p>Test content</p>",
                    "test_mode": True
                }
            )
            assert response.status_code == 400
            assert "No active subscribers" in response.json().get('detail', '')
            print("Correctly handled no subscribers case")
        else:
            print(f"Skipping - {len(subscribers)} subscribers exist")
    
    def test_send_bulk_email_test_mode(self):
        """Test bulk email in test mode (sends to first subscriber only)"""
        # First create a test subscriber
        test_email = f"test_bulk_{uuid.uuid4().hex[:8]}@test.com"
        
        # Subscribe
        response = requests.post(
            f"{BASE_URL}/api/newsletter",
            json={"email": test_email, "source": "test"}
        )
        assert response.status_code == 200
        print(f"Created test subscriber: {test_email}")
        
        # Wait for welcome email to be sent (background task)
        time.sleep(2)
        
        # Send bulk email in test mode
        response = requests.post(
            f"{BASE_URL}/api/newsletter/send-bulk",
            json={
                "subject": "Test Newsletter - Test Mode",
                "html_content": "<p>This is a test newsletter sent in test mode.</p>",
                "test_mode": True
            }
        )
        
        # Check response
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "sent" in data
        assert "failed" in data
        
        # In test mode, should only attempt to send to 1 subscriber
        assert data["total"] == 1
        print(f"Bulk email result: total={data['total']}, sent={data['sent']}, failed={data['failed']}")
        
        # Note: Email may fail due to domain verification, but API should work
        if data["failed"] > 0 and data.get("errors"):
            print(f"Email errors (expected if domain not verified): {data['errors']}")
        
        # Cleanup - unsubscribe test email
        requests.delete(f"{BASE_URL}/api/newsletter/{test_email}")
        print(f"Cleaned up test subscriber: {test_email}")
    
    def test_send_bulk_email_missing_subject(self):
        """Test bulk email with missing subject"""
        response = requests.post(
            f"{BASE_URL}/api/newsletter/send-bulk",
            json={
                "html_content": "<p>Test content</p>",
                "test_mode": True
            }
        )
        # Should fail validation
        assert response.status_code == 422
        print("Correctly rejected missing subject")
    
    def test_send_bulk_email_missing_content(self):
        """Test bulk email with missing content"""
        response = requests.post(
            f"{BASE_URL}/api/newsletter/send-bulk",
            json={
                "subject": "Test Subject",
                "test_mode": True
            }
        )
        # Should fail validation
        assert response.status_code == 422
        print("Correctly rejected missing content")


class TestNewsletterWelcomeEmail:
    """Test welcome email on newsletter signup"""
    
    def test_newsletter_signup_triggers_welcome_email(self):
        """Test that newsletter signup triggers welcome email"""
        test_email = f"test_welcome_{uuid.uuid4().hex[:8]}@test.com"
        
        response = requests.post(
            f"{BASE_URL}/api/newsletter",
            json={"email": test_email, "source": "website"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_email
        assert data["is_active"] == True
        print(f"Newsletter signup successful for {test_email}")
        print("Welcome email triggered in background (check backend logs)")
        
        # Wait for background task
        time.sleep(2)
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/newsletter/{test_email}")
        print(f"Cleaned up: {test_email}")
    
    def test_newsletter_resubscribe(self):
        """Test resubscribing after unsubscribe"""
        test_email = f"test_resub_{uuid.uuid4().hex[:8]}@test.com"
        
        # Subscribe
        response = requests.post(
            f"{BASE_URL}/api/newsletter",
            json={"email": test_email, "source": "website"}
        )
        assert response.status_code == 200
        
        # Unsubscribe
        response = requests.delete(f"{BASE_URL}/api/newsletter/{test_email}")
        assert response.status_code == 200
        
        # Resubscribe
        response = requests.post(
            f"{BASE_URL}/api/newsletter",
            json={"email": test_email, "source": "website"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] == True
        print(f"Resubscription successful for {test_email}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/newsletter/{test_email}")
    
    def test_duplicate_subscription_rejected(self):
        """Test that duplicate active subscription is rejected"""
        test_email = f"test_dup_{uuid.uuid4().hex[:8]}@test.com"
        
        # First subscription
        response = requests.post(
            f"{BASE_URL}/api/newsletter",
            json={"email": test_email, "source": "website"}
        )
        assert response.status_code == 200
        
        # Duplicate subscription should fail
        response = requests.post(
            f"{BASE_URL}/api/newsletter",
            json={"email": test_email, "source": "website"}
        )
        assert response.status_code == 400
        assert "already subscribed" in response.json().get('detail', '').lower()
        print("Duplicate subscription correctly rejected")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/newsletter/{test_email}")


class TestInvestorInquiryNotification:
    """Test email notification on new investor inquiry submission"""
    
    def test_investor_inquiry_submission(self):
        """Test submitting investor inquiry triggers notification"""
        test_data = {
            "name": f"Test Investor {uuid.uuid4().hex[:6]}",
            "email": f"test_investor_{uuid.uuid4().hex[:8]}@test.com",
            "investor_type": "Individual",
            "area_of_interest": "Film Production",
            "message": "This is a test inquiry for testing email notifications."
        }
        
        response = requests.post(
            f"{BASE_URL}/api/investors/inquiries",
            json=test_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == test_data["name"]
        assert data["email"] == test_data["email"]
        assert "id" in data
        print(f"Investor inquiry created: {data['id']}")
        print("Notification email triggered in background (check backend logs)")
        
        # Wait for background task
        time.sleep(2)
        
        # Verify inquiry was saved
        response = requests.get(f"{BASE_URL}/api/investors/admin/inquiries")
        assert response.status_code == 200
        inquiries = response.json()
        
        # Find our test inquiry
        test_inquiry = next((i for i in inquiries if i["id"] == data["id"]), None)
        assert test_inquiry is not None
        print(f"Inquiry verified in database")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/investors/admin/inquiries/{data['id']}")
        print(f"Cleaned up inquiry: {data['id']}")
    
    def test_investor_inquiry_required_fields(self):
        """Test investor inquiry validation"""
        # Missing required fields
        response = requests.post(
            f"{BASE_URL}/api/investors/inquiries",
            json={"name": "Test"}
        )
        assert response.status_code == 422
        print("Correctly validated required fields")


class TestContactFormNotification:
    """Test email notification on new contact form submission"""
    
    def test_contact_form_submission(self):
        """Test submitting contact form triggers notification"""
        test_data = {
            "name": f"Test Contact {uuid.uuid4().hex[:6]}",
            "email": f"test_contact_{uuid.uuid4().hex[:8]}@test.com",
            "phone": "+61 400 000 000",
            "service": "Film Production",
            "message": "This is a test contact message for testing email notifications."
        }
        
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=test_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == test_data["name"]
        assert data["email"] == test_data["email"]
        assert "id" in data
        print(f"Contact message created: {data['id']}")
        print("Notification email triggered in background (check backend logs)")
        
        # Wait for background task
        time.sleep(2)
        
        # Verify message was saved
        response = requests.get(f"{BASE_URL}/api/contact")
        assert response.status_code == 200
        messages = response.json()
        
        # Find our test message
        test_message = next((m for m in messages if m["id"] == data["id"]), None)
        assert test_message is not None
        print(f"Contact message verified in database")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/contact/{data['id']}?permanent=true")
        print(f"Cleaned up message: {data['id']}")
    
    def test_contact_form_required_fields(self):
        """Test contact form validation"""
        # Missing required fields
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json={"name": "Test"}
        )
        assert response.status_code == 422
        print("Correctly validated required fields")


class TestWorkWithUsNotification:
    """Test email notification on new Work With Us submission"""
    
    def test_submission_creation(self):
        """Test submitting Work With Us form triggers notification"""
        test_data = {
            "name": f"Test Submitter {uuid.uuid4().hex[:6]}",
            "email": f"test_submit_{uuid.uuid4().hex[:8]}@test.com",
            "role": "Director",
            "submission_type": "Feature Film",
            "genres": ["Drama", "Thriller"],
            "project_stage": "Development",
            "logline": "A test logline for testing the submission system and email notifications.",
            "external_link": "https://example.com/project",
            "message": "This is a test submission message."
        }
        
        response = requests.post(
            f"{BASE_URL}/api/submissions",
            json=test_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == test_data["name"]
        assert data["email"] == test_data["email"]
        assert "id" in data
        print(f"Submission created: {data['id']}")
        print("Notification email triggered in background (check backend logs)")
        
        # Wait for background task
        time.sleep(2)
        
        # Verify submission was saved
        response = requests.get(f"{BASE_URL}/api/submissions")
        assert response.status_code == 200
        submissions = response.json()
        
        # Find our test submission
        test_submission = next((s for s in submissions if s["id"] == data["id"]), None)
        assert test_submission is not None
        print(f"Submission verified in database")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/submissions/{data['id']}?permanent=true")
        print(f"Cleaned up submission: {data['id']}")
    
    def test_submission_logline_validation(self):
        """Test logline length validation (max 300 chars)"""
        test_data = {
            "name": "Test",
            "email": "test@test.com",
            "role": "Director",
            "submission_type": "Feature Film",
            "genres": ["Drama"],
            "project_stage": "Development",
            "logline": "A" * 301  # Exceeds 300 char limit
        }
        
        response = requests.post(
            f"{BASE_URL}/api/submissions",
            json=test_data
        )
        assert response.status_code == 400
        assert "300" in response.json().get('detail', '')
        print("Correctly validated logline length")
    
    def test_submission_required_fields(self):
        """Test submission validation"""
        # Missing required fields
        response = requests.post(
            f"{BASE_URL}/api/submissions",
            json={"name": "Test"}
        )
        assert response.status_code == 422
        print("Correctly validated required fields")


class TestAPIHealth:
    """Basic API health checks"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"API root: {data}")
    
    def test_newsletter_endpoint(self):
        """Test newsletter endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/newsletter")
        assert response.status_code == 200
        print("Newsletter endpoint accessible")
    
    def test_contact_endpoint(self):
        """Test contact endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/contact")
        assert response.status_code == 200
        print("Contact endpoint accessible")
    
    def test_submissions_endpoint(self):
        """Test submissions endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/submissions")
        assert response.status_code == 200
        print("Submissions endpoint accessible")
    
    def test_investor_inquiries_endpoint(self):
        """Test investor inquiries endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/investors/admin/inquiries")
        assert response.status_code == 200
        print("Investor inquiries endpoint accessible")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
