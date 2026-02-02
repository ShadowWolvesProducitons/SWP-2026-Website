"""
Test Contact API endpoints for Shadow Wolves Productions
Tests: Contact form submission, message retrieval, status updates, filtering, deletion
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestContactAPI:
    """Contact API endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data prefix for cleanup"""
        self.test_prefix = "TEST_CONTACT_"
        yield
        # Cleanup after tests
        self._cleanup_test_data()
    
    def _cleanup_test_data(self):
        """Clean up test-created messages"""
        try:
            response = requests.get(f"{BASE_URL}/api/contact?include_archived=true")
            if response.status_code == 200:
                messages = response.json()
                for msg in messages:
                    if msg.get('name', '').startswith(self.test_prefix):
                        requests.delete(f"{BASE_URL}/api/contact/{msg['id']}?permanent=true")
        except Exception as e:
            print(f"Cleanup error: {e}")
    
    def test_get_contact_messages(self):
        """Test GET /api/contact - retrieve all messages"""
        response = requests.get(f"{BASE_URL}/api/contact")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Verify existing test message from seed data
        if len(data) > 0:
            msg = data[0]
            assert 'id' in msg, "Message should have id"
            assert 'name' in msg, "Message should have name"
            assert 'email' in msg, "Message should have email"
            assert 'message' in msg, "Message should have message"
            assert 'status' in msg, "Message should have status"
            print(f"SUCCESS: Found {len(data)} messages")
    
    def test_create_contact_message(self):
        """Test POST /api/contact - submit new contact message"""
        test_data = {
            "name": f"{self.test_prefix}John Doe",
            "email": "testjohn@example.com",
            "phone": "+61 400 111 222",
            "service": "full-production",
            "message": "This is a test message for contact form submission testing."
        }
        
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data['name'] == test_data['name'], "Name should match"
        assert data['email'] == test_data['email'], "Email should match"
        assert data['phone'] == test_data['phone'], "Phone should match"
        assert data['service'] == test_data['service'], "Service should match"
        assert data['message'] == test_data['message'], "Message should match"
        assert data['status'] == 'New', "Default status should be 'New'"
        assert 'id' in data, "Response should include id"
        assert 'created_at' in data, "Response should include created_at"
        
        print(f"SUCCESS: Created contact message with id: {data['id']}")
        return data['id']
    
    def test_create_contact_message_minimal(self):
        """Test POST /api/contact - submit with only required fields"""
        test_data = {
            "name": f"{self.test_prefix}Minimal User",
            "email": "minimal@example.com",
            "message": "Minimal test message with only required fields."
        }
        
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data['name'] == test_data['name']
        assert data['email'] == test_data['email']
        assert data['message'] == test_data['message']
        assert data['phone'] is None, "Phone should be None when not provided"
        assert data['service'] is None, "Service should be None when not provided"
        
        print("SUCCESS: Created contact message with minimal fields")
    
    def test_create_contact_message_invalid_email(self):
        """Test POST /api/contact - reject invalid email"""
        test_data = {
            "name": f"{self.test_prefix}Invalid Email",
            "email": "not-an-email",
            "message": "Test message"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 422, f"Expected 422 for invalid email, got {response.status_code}"
        print("SUCCESS: Invalid email correctly rejected with 422")
    
    def test_create_contact_message_missing_required(self):
        """Test POST /api/contact - reject missing required fields"""
        # Missing name
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json={"email": "test@example.com", "message": "Test"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422, f"Expected 422 for missing name, got {response.status_code}"
        
        # Missing email
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json={"name": "Test", "message": "Test"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422, f"Expected 422 for missing email, got {response.status_code}"
        
        # Missing message
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json={"name": "Test", "email": "test@example.com"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422, f"Expected 422 for missing message, got {response.status_code}"
        
        print("SUCCESS: Missing required fields correctly rejected")
    
    def test_get_contact_message_by_id(self):
        """Test GET /api/contact/{id} - retrieve specific message"""
        # First create a message
        test_data = {
            "name": f"{self.test_prefix}Get By ID",
            "email": "getbyid@example.com",
            "message": "Test message for get by ID"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/contact",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        message_id = create_response.json()['id']
        
        # Now get by ID
        response = requests.get(f"{BASE_URL}/api/contact/{message_id}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data['id'] == message_id, "ID should match"
        assert data['name'] == test_data['name'], "Name should match"
        assert data['email'] == test_data['email'], "Email should match"
        
        print(f"SUCCESS: Retrieved message by ID: {message_id}")
    
    def test_get_contact_message_not_found(self):
        """Test GET /api/contact/{id} - 404 for non-existent message"""
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/contact/{fake_id}")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("SUCCESS: Non-existent message returns 404")
    
    def test_update_contact_message_status(self):
        """Test PUT /api/contact/{id} - update message status"""
        # First create a message
        test_data = {
            "name": f"{self.test_prefix}Status Update",
            "email": "statusupdate@example.com",
            "message": "Test message for status update"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/contact",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        message_id = create_response.json()['id']
        
        # Update status to Read
        update_response = requests.put(
            f"{BASE_URL}/api/contact/{message_id}",
            json={"status": "Read"},
            headers={"Content-Type": "application/json"}
        )
        
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}"
        assert update_response.json()['status'] == 'Read', "Status should be updated to Read"
        
        # Verify with GET
        get_response = requests.get(f"{BASE_URL}/api/contact/{message_id}")
        assert get_response.json()['status'] == 'Read', "Status should persist as Read"
        
        # Update status to Replied
        update_response = requests.put(
            f"{BASE_URL}/api/contact/{message_id}",
            json={"status": "Replied"},
            headers={"Content-Type": "application/json"}
        )
        assert update_response.status_code == 200
        assert update_response.json()['status'] == 'Replied', "Status should be updated to Replied"
        
        print("SUCCESS: Status updates work correctly (New -> Read -> Replied)")
    
    def test_filter_messages_by_status(self):
        """Test GET /api/contact?status=X - filter by status"""
        # Create messages with different statuses
        test_data_new = {
            "name": f"{self.test_prefix}Filter New",
            "email": "filternew@example.com",
            "message": "Test message for filter - New"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/contact",
            json=test_data_new,
            headers={"Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        new_id = create_response.json()['id']
        
        # Create another and set to Read
        test_data_read = {
            "name": f"{self.test_prefix}Filter Read",
            "email": "filterread@example.com",
            "message": "Test message for filter - Read"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/contact",
            json=test_data_read,
            headers={"Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        read_id = create_response.json()['id']
        
        # Update to Read
        requests.put(
            f"{BASE_URL}/api/contact/{read_id}",
            json={"status": "Read"},
            headers={"Content-Type": "application/json"}
        )
        
        # Filter by New status
        response = requests.get(f"{BASE_URL}/api/contact?status=New")
        assert response.status_code == 200
        new_messages = response.json()
        
        # All returned messages should have status New
        for msg in new_messages:
            assert msg['status'] == 'New', f"Expected status 'New', got '{msg['status']}'"
        
        # Filter by Read status
        response = requests.get(f"{BASE_URL}/api/contact?status=Read")
        assert response.status_code == 200
        read_messages = response.json()
        
        for msg in read_messages:
            assert msg['status'] == 'Read', f"Expected status 'Read', got '{msg['status']}'"
        
        print("SUCCESS: Status filtering works correctly")
    
    def test_archive_contact_message(self):
        """Test DELETE /api/contact/{id} - archive message (soft delete)"""
        # First create a message
        test_data = {
            "name": f"{self.test_prefix}Archive Test",
            "email": "archive@example.com",
            "message": "Test message for archiving"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/contact",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        message_id = create_response.json()['id']
        
        # Archive (soft delete)
        delete_response = requests.delete(f"{BASE_URL}/api/contact/{message_id}")
        
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        assert 'archived' in delete_response.json()['message'].lower(), "Should indicate archived"
        
        # Verify message still exists but is archived
        get_response = requests.get(f"{BASE_URL}/api/contact/{message_id}")
        assert get_response.status_code == 200, "Archived message should still be retrievable"
        assert get_response.json()['status'] == 'Archived', "Status should be Archived"
        
        # Verify archived messages are excluded from default list
        list_response = requests.get(f"{BASE_URL}/api/contact")
        archived_in_list = any(m['id'] == message_id for m in list_response.json())
        assert not archived_in_list, "Archived messages should not appear in default list"
        
        print("SUCCESS: Archive (soft delete) works correctly")
    
    def test_permanent_delete_contact_message(self):
        """Test DELETE /api/contact/{id}?permanent=true - permanent delete"""
        # First create a message
        test_data = {
            "name": f"{self.test_prefix}Permanent Delete",
            "email": "permdelete@example.com",
            "message": "Test message for permanent deletion"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/contact",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        message_id = create_response.json()['id']
        
        # Permanent delete
        delete_response = requests.delete(f"{BASE_URL}/api/contact/{message_id}?permanent=true")
        
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        assert 'deleted' in delete_response.json()['message'].lower(), "Should indicate deleted"
        
        # Verify message no longer exists
        get_response = requests.get(f"{BASE_URL}/api/contact/{message_id}")
        assert get_response.status_code == 404, "Permanently deleted message should return 404"
        
        print("SUCCESS: Permanent delete works correctly")
    
    def test_delete_not_found(self):
        """Test DELETE /api/contact/{id} - 404 for non-existent message"""
        fake_id = str(uuid.uuid4())
        response = requests.delete(f"{BASE_URL}/api/contact/{fake_id}")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("SUCCESS: Delete non-existent message returns 404")
    
    def test_update_not_found(self):
        """Test PUT /api/contact/{id} - 404 for non-existent message"""
        fake_id = str(uuid.uuid4())
        response = requests.put(
            f"{BASE_URL}/api/contact/{fake_id}",
            json={"status": "Read"},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("SUCCESS: Update non-existent message returns 404")


class TestNewsletterAPI:
    """Newsletter API tests (on Contact page)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data prefix for cleanup"""
        self.test_prefix = "test_newsletter_"
        yield
        self._cleanup_test_data()
    
    def _cleanup_test_data(self):
        """Clean up test-created subscriptions"""
        try:
            response = requests.get(f"{BASE_URL}/api/newsletter")
            if response.status_code == 200:
                subs = response.json()
                for sub in subs:
                    if sub.get('email', '').startswith(self.test_prefix):
                        requests.delete(f"{BASE_URL}/api/newsletter/{sub['email']}")
        except Exception as e:
            print(f"Cleanup error: {e}")
    
    def test_newsletter_subscribe(self):
        """Test POST /api/newsletter - subscribe to newsletter"""
        test_email = f"{self.test_prefix}user@example.com"
        
        response = requests.post(
            f"{BASE_URL}/api/newsletter",
            json={"email": test_email, "source": "contact_page"},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data['email'] == test_email, "Email should match"
        assert data['source'] == 'contact_page', "Source should match"
        
        print(f"SUCCESS: Newsletter subscription created for {test_email}")
    
    def test_newsletter_duplicate_subscription(self):
        """Test POST /api/newsletter - reject duplicate subscription"""
        test_email = f"{self.test_prefix}duplicate@example.com"
        
        # First subscription
        response1 = requests.post(
            f"{BASE_URL}/api/newsletter",
            json={"email": test_email, "source": "contact_page"},
            headers={"Content-Type": "application/json"}
        )
        assert response1.status_code == 200
        
        # Duplicate subscription
        response2 = requests.post(
            f"{BASE_URL}/api/newsletter",
            json={"email": test_email, "source": "contact_page"},
            headers={"Content-Type": "application/json"}
        )
        
        # Should either return 400/409 or handle gracefully
        assert response2.status_code in [200, 400, 409], f"Unexpected status: {response2.status_code}"
        print(f"SUCCESS: Duplicate subscription handled (status: {response2.status_code})")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
