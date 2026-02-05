"""
Test suite for Investor Portal features:
- Document requests endpoint
- Expression of Interest with project selection
- Project documents endpoint
- Investor authentication
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestInvestorPortalAuth:
    """Test investor portal authentication"""
    
    def test_portal_status(self):
        """Test portal status endpoint"""
        response = requests.get(f"{BASE_URL}/api/investors/portal-status")
        assert response.status_code == 200
        data = response.json()
        assert "enabled" in data
        assert "require_code" in data
    
    def test_investor_login_with_password(self):
        """Test investor login with global password"""
        response = requests.post(
            f"{BASE_URL}/api/investors/auth",
            json={"password": "investor2024"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["message"] == "Access granted"
    
    def test_investor_login_invalid_password(self):
        """Test investor login with invalid password"""
        response = requests.post(
            f"{BASE_URL}/api/investors/auth",
            json={"password": "wrongpassword"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == False


class TestInvestorProjects:
    """Test investor projects (development slate)"""
    
    def test_get_projects(self):
        """Test getting visible projects"""
        response = requests.get(f"{BASE_URL}/api/investors/projects")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Verify project structure if projects exist
        if len(data) > 0:
            project = data[0]
            assert "id" in project
            assert "title" in project
            assert "genre" in project
            assert "status" in project
            assert "hook" in project
            assert "description" in project
    
    def test_get_project_documents(self):
        """Test getting documents for a specific project"""
        # First get a project
        projects_response = requests.get(f"{BASE_URL}/api/investors/projects")
        projects = projects_response.json()
        
        if len(projects) > 0:
            project_id = projects[0]["id"]
            response = requests.get(f"{BASE_URL}/api/investors/projects/{project_id}/documents")
            assert response.status_code == 200
            data = response.json()
            assert "project_id" in data
            assert "available_doc_types" in data
            assert "documents" in data


class TestDocumentRequests:
    """Test document request functionality"""
    
    @pytest.fixture
    def project_id(self):
        """Get a valid project ID for testing"""
        response = requests.get(f"{BASE_URL}/api/investors/projects")
        projects = response.json()
        if len(projects) > 0:
            return projects[0]["id"], projects[0]["title"]
        pytest.skip("No projects available for testing")
    
    def test_create_document_request_pitch_deck(self, project_id):
        """Test creating a Pitch Deck document request"""
        proj_id, proj_title = project_id
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(
            f"{BASE_URL}/api/investors/document-requests",
            json={
                "project_id": proj_id,
                "project_title": proj_title,
                "doc_type": "Pitch Deck",
                "name": "TEST_Investor Name",
                "email": test_email,
                "company": "Test Company",
                "phone": "555-1234"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["project_id"] == proj_id
        assert data["doc_type"] == "Pitch Deck"
        assert data["name"] == "TEST_Investor Name"
        assert data["email"] == test_email
        assert data["status"] == "pending"
        assert "id" in data
    
    def test_create_document_request_screener(self, project_id):
        """Test creating a Screener document request"""
        proj_id, proj_title = project_id
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(
            f"{BASE_URL}/api/investors/document-requests",
            json={
                "project_id": proj_id,
                "project_title": proj_title,
                "doc_type": "Screener",
                "name": "TEST_Screener Requester",
                "email": test_email
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["doc_type"] == "Screener"
        assert data["status"] == "pending"
    
    def test_create_document_request_script(self, project_id):
        """Test creating a Script document request"""
        proj_id, proj_title = project_id
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(
            f"{BASE_URL}/api/investors/document-requests",
            json={
                "project_id": proj_id,
                "project_title": proj_title,
                "doc_type": "Script",
                "name": "TEST_Script Requester",
                "email": test_email,
                "company": "Film Studio Inc"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["doc_type"] == "Script"
        assert data["status"] == "pending"
    
    def test_create_document_request_missing_required_fields(self, project_id):
        """Test document request with missing required fields"""
        proj_id, proj_title = project_id
        
        # Missing email
        response = requests.post(
            f"{BASE_URL}/api/investors/document-requests",
            json={
                "project_id": proj_id,
                "project_title": proj_title,
                "doc_type": "Pitch Deck",
                "name": "TEST_Missing Email"
            }
        )
        assert response.status_code == 422  # Validation error


class TestInvestorInquiries:
    """Test investor expression of interest functionality"""
    
    @pytest.fixture
    def project_id(self):
        """Get a valid project ID for testing"""
        response = requests.get(f"{BASE_URL}/api/investors/projects")
        projects = response.json()
        if len(projects) > 0:
            return projects[0]["id"], projects[0]["title"]
        pytest.skip("No projects available for testing")
    
    def test_create_inquiry_single_project(self, project_id):
        """Test creating inquiry with Single Project interest"""
        proj_id, proj_title = project_id
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(
            f"{BASE_URL}/api/investors/inquiries",
            json={
                "name": "TEST_Single Project Investor",
                "email": test_email,
                "investor_type": "Individual",
                "area_of_interest": "Single Project",
                "selected_project_id": proj_id,
                "selected_project_title": proj_title,
                "message": "Interested in this specific project"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_Single Project Investor"
        assert data["area_of_interest"] == "Single Project"
        assert data["selected_project_id"] == proj_id
        assert data["selected_project_title"] == proj_title
        assert data["status"] == "New"
    
    def test_create_inquiry_slate_investment(self):
        """Test creating inquiry with Slate Investment interest"""
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(
            f"{BASE_URL}/api/investors/inquiries",
            json={
                "name": "TEST_Slate Investor",
                "email": test_email,
                "investor_type": "Family Office",
                "area_of_interest": "Slate Investment",
                "message": "Interested in portfolio investment"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["area_of_interest"] == "Slate Investment"
        assert data["selected_project_id"] is None
    
    def test_create_inquiry_strategic_partnership(self):
        """Test creating inquiry with Strategic Partnership interest"""
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(
            f"{BASE_URL}/api/investors/inquiries",
            json={
                "name": "TEST_Strategic Partner",
                "email": test_email,
                "investor_type": "Strategic Partner",
                "area_of_interest": "Strategic Partnership"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["investor_type"] == "Strategic Partner"
        assert data["area_of_interest"] == "Strategic Partnership"
    
    def test_create_inquiry_all_investor_types(self):
        """Test creating inquiries with all investor types"""
        investor_types = ["Individual", "Family Office", "Venture Capital", "Strategic Partner", "Other"]
        
        for inv_type in investor_types:
            test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
            response = requests.post(
                f"{BASE_URL}/api/investors/inquiries",
                json={
                    "name": f"TEST_{inv_type} Investor",
                    "email": test_email,
                    "investor_type": inv_type,
                    "area_of_interest": "Slate Investment"
                }
            )
            assert response.status_code == 200
            data = response.json()
            assert data["investor_type"] == inv_type


class TestAdminDocumentRequests:
    """Test admin endpoints for document requests"""
    
    def test_get_document_requests(self):
        """Test getting all document requests (admin)"""
        response = requests.get(f"{BASE_URL}/api/investors/admin/document-requests")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestGeneralDocuments:
    """Test general documents endpoint (not project-linked)"""
    
    def test_get_general_documents(self):
        """Test getting general investor documents"""
        response = requests.get(f"{BASE_URL}/api/investors/documents")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # These should only be documents without project_id


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
