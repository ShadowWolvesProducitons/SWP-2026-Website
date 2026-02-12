"""
Test new features for iteration 9:
- Assets API CRUD (Admin Assets Library)
- Investor request-access endpoint 
- Investor login (email/password + legacy auth)
- Investor signup validation
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAssetsAPI:
    """Test Admin Assets Library CRUD operations"""

    def test_list_assets(self):
        """GET /api/assets - List all assets"""
        response = requests.get(f"{BASE_URL}/api/assets")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of assets"
        print(f"✓ List assets: {len(data)} assets found")
        return data

    def test_list_assets_with_filter(self):
        """GET /api/assets?asset_type=pdf - Filter by type"""
        response = requests.get(f"{BASE_URL}/api/assets", params={"asset_type": "pdf"})
        assert response.status_code == 200
        data = response.json()
        for asset in data:
            assert asset.get("asset_type") == "pdf"
        print(f"✓ Filter by type: {len(data)} PDF assets")

    def test_list_assets_with_search(self):
        """GET /api/assets?search=test - Search assets"""
        response = requests.get(f"{BASE_URL}/api/assets", params={"search": "test"})
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Search assets: {len(data)} matches for 'test'")

    def test_get_single_asset(self):
        """GET /api/assets/:id - Get single asset"""
        # First list assets to get an ID
        list_response = requests.get(f"{BASE_URL}/api/assets")
        assets = list_response.json()
        if not assets:
            pytest.skip("No assets in database to test")
        
        asset_id = assets[0]["id"]
        response = requests.get(f"{BASE_URL}/api/assets/{asset_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == asset_id
        print(f"✓ Get single asset: {data['original_name']}")

    def test_get_nonexistent_asset(self):
        """GET /api/assets/:id - 404 for non-existent asset"""
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/assets/{fake_id}")
        assert response.status_code == 404
        print("✓ Non-existent asset returns 404")

    def test_update_asset_visibility(self):
        """PUT /api/assets/:id - Update asset metadata"""
        # Get an existing asset
        list_response = requests.get(f"{BASE_URL}/api/assets")
        assets = list_response.json()
        if not assets:
            pytest.skip("No assets in database to test")
        
        asset_id = assets[0]["id"]
        original_visibility = assets[0].get("visibility", "admin_only")
        
        # Update visibility
        new_visibility = "public" if original_visibility != "public" else "investor_only"
        response = requests.put(
            f"{BASE_URL}/api/assets/{asset_id}",
            json={"visibility": new_visibility}
        )
        assert response.status_code == 200
        
        # Verify update
        get_response = requests.get(f"{BASE_URL}/api/assets/{asset_id}")
        updated_asset = get_response.json()
        assert updated_asset["visibility"] == new_visibility
        
        # Restore original visibility
        requests.put(f"{BASE_URL}/api/assets/{asset_id}", json={"visibility": original_visibility})
        print(f"✓ Update asset visibility: {original_visibility} -> {new_visibility}")


class TestInvestorPortalStatus:
    """Test Investor Portal status endpoint"""

    def test_portal_status(self):
        """GET /api/investors/portal-status"""
        response = requests.get(f"{BASE_URL}/api/investors/portal-status")
        assert response.status_code == 200
        data = response.json()
        assert "enabled" in data
        assert "require_code" in data
        print(f"✓ Portal status: enabled={data['enabled']}, require_code={data['require_code']}")


class TestInvestorAuth:
    """Test Investor authentication endpoints"""

    def test_legacy_password_auth(self):
        """POST /api/investors/auth - Legacy password login"""
        response = requests.post(
            f"{BASE_URL}/api/investors/auth",
            json={"password": "investor2024"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✓ Legacy password auth: success={data['success']}")

    def test_legacy_password_auth_invalid(self):
        """POST /api/investors/auth - Invalid password"""
        response = requests.post(
            f"{BASE_URL}/api/investors/auth",
            json={"password": "wrongpassword"}
        )
        assert response.status_code == 200  # Returns success=False, not 401
        data = response.json()
        assert data.get("success") == False
        print(f"✓ Invalid password auth: correctly rejected")

    def test_access_code_auth(self):
        """POST /api/investors/auth - Access code login"""
        response = requests.post(
            f"{BASE_URL}/api/investors/auth",
            json={"access_code": "SMITH2024"}
        )
        # May succeed or fail depending on whether this code exists
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Access code auth: success={data.get('success')}")

    def test_email_login_invalid(self):
        """POST /api/investors/login - Invalid email/password"""
        response = requests.post(
            f"{BASE_URL}/api/investors/login",
            json={"email": "nonexistent@test.com", "password": "wrongpass"}
        )
        assert response.status_code == 401
        print("✓ Email login: correctly rejects invalid credentials")


class TestInvestorRequestAccess:
    """Test investor access request (public endpoint)"""

    def test_request_access_missing_acks(self):
        """POST /api/investors/request-access - Missing acknowledgements"""
        response = requests.post(
            f"{BASE_URL}/api/investors/request-access",
            json={
                "name": "Test User",
                "email": f"test{uuid.uuid4().hex[:8]}@example.com",
                "investor_type": "Individual",
                "area_of_interest": "Single Project",
                "confidentiality_ack": False,  # Missing
                "risk_ack": True
            }
        )
        assert response.status_code == 400
        print("✓ Request access: requires both acknowledgements")

    def test_request_access_success(self):
        """POST /api/investors/request-access - Success flow"""
        unique_email = f"test_investor_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(
            f"{BASE_URL}/api/investors/request-access",
            json={
                "name": "Test Investor",
                "email": unique_email,
                "investor_type": "Individual",
                "area_of_interest": "Slate Investment",
                "message": "Testing via automated test",
                "confidentiality_ack": True,
                "risk_ack": True
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Request access success: {data.get('message')}")


class TestInvestorSignupValidation:
    """Test investor signup token validation"""

    def test_validate_invalid_token(self):
        """GET /api/investors/validate-token/:token - Invalid token"""
        response = requests.get(f"{BASE_URL}/api/investors/validate-token/invalid_token_12345")
        assert response.status_code == 404
        print("✓ Token validation: rejects invalid token")


class TestInvestorProjects:
    """Test investor projects endpoint (for portal)"""

    def test_get_investor_projects(self):
        """GET /api/investors/projects - Public visible projects"""
        response = requests.get(f"{BASE_URL}/api/investors/projects")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Investor projects: {len(data)} visible projects")


class TestInvestorDocuments:
    """Test investor documents endpoint"""

    def test_get_investor_documents(self):
        """GET /api/investors/documents - Public visible documents"""
        response = requests.get(f"{BASE_URL}/api/investors/documents")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Investor documents: {len(data)} visible documents")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
