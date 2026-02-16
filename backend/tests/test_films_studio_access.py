"""
Test Suite for Films System Refactor - Part 1 & Part 2
- Part 1: Public Project Overview page features
- Part 2: Studio Access page with token-based access control
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from the review request
TEST_TOKEN = "8c818a77-b274-492b-9a56-bb986bc3ec2c"
TEST_FILM_SLUG = "crowe"


class TestFilmsAPI:
    """Tests for Film-related endpoints"""
    
    def test_get_all_films(self):
        """GET /api/films returns list of films"""
        response = requests.get(f"{BASE_URL}/api/films")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of films"
        assert len(data) > 0, "Expected at least one film"
        print(f"PASS: GET /api/films returned {len(data)} films")
    
    def test_get_film_by_slug_crowe(self):
        """GET /api/films/by-slug/crowe returns CROWE film"""
        response = requests.get(f"{BASE_URL}/api/films/by-slug/{TEST_FILM_SLUG}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify essential film fields
        assert data.get('title') == 'CROWE', f"Expected title CROWE, got {data.get('title')}"
        assert data.get('slug') == TEST_FILM_SLUG, f"Expected slug {TEST_FILM_SLUG}"
        assert 'logline' in data, "Film should have logline"
        assert 'tagline' in data, "Film should have tagline"
        assert 'status' in data, "Film should have status"
        assert data.get('studio_access_enabled') == True, "CROWE should have studio_access_enabled=True"
        print(f"PASS: GET /api/films/by-slug/crowe returned correct film data")
    
    def test_get_film_by_slug_not_found(self):
        """GET /api/films/by-slug/nonexistent returns 404"""
        response = requests.get(f"{BASE_URL}/api/films/by-slug/nonexistent-film-xyz")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: Non-existent film slug returns 404")
    
    def test_film_has_financial_info(self):
        """CROWE film has financial information for studio access"""
        response = requests.get(f"{BASE_URL}/api/films/by-slug/{TEST_FILM_SLUG}")
        assert response.status_code == 200
        data = response.json()
        
        # Check financial fields exist (may be empty but should be present)
        assert 'target_budget_range' in data, "Film should have target_budget_range field"
        assert 'financing_structure' in data, "Film should have financing_structure field"
        assert 'incentives' in data, "Film should have incentives field"
        
        # CROWE should have these populated
        assert data.get('target_budget_range'), "CROWE should have target_budget_range"
        assert data.get('financing_structure'), "CROWE should have financing_structure"
        print("PASS: CROWE has financial information")


class TestStudioAccessAPI:
    """Tests for Studio Access token-based page"""
    
    def test_verify_valid_token(self):
        """Studio access verify with valid token returns film and user"""
        response = requests.get(
            f"{BASE_URL}/api/studio-access/verify/{TEST_FILM_SLUG}",
            params={'token': TEST_TOKEN}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify response structure
        assert 'film' in data, "Response should contain film data"
        assert 'user' in data, "Response should contain user data"
        
        # Verify film data
        film = data['film']
        assert film.get('title') == 'CROWE', "Film title should be CROWE"
        assert film.get('studio_access_enabled') == True, "Studio access should be enabled"
        
        # Verify user data
        user = data['user']
        assert user.get('name') == 'John Producer', f"User name should be John Producer, got {user.get('name')}"
        assert user.get('email') == 'john@example.com', "User email should be john@example.com"
        assert 'company' in user, "User should have company field"
        print("PASS: Valid token returns film and user data")
    
    def test_verify_invalid_token(self):
        """Studio access verify with invalid token returns 401"""
        response = requests.get(
            f"{BASE_URL}/api/studio-access/verify/{TEST_FILM_SLUG}",
            params={'token': 'invalid-token-12345'}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert 'detail' in data, "Error response should have detail"
        print("PASS: Invalid token returns 401 Access Denied")
    
    def test_verify_missing_token(self):
        """Studio access verify without token returns error"""
        response = requests.get(f"{BASE_URL}/api/studio-access/verify/{TEST_FILM_SLUG}")
        # Should return 422 (validation error) or 401/400
        assert response.status_code in [400, 401, 422], f"Expected error status, got {response.status_code}"
        print("PASS: Missing token returns error")
    
    def test_verify_nonexistent_film(self):
        """Studio access verify for non-existent film returns 401 (token not found)"""
        response = requests.get(
            f"{BASE_URL}/api/studio-access/verify/nonexistent-film",
            params={'token': TEST_TOKEN}
        )
        # Either 401 (token not linked to this film) or 404 (film not found)
        assert response.status_code in [401, 404], f"Expected 401 or 404, got {response.status_code}"
        print("PASS: Non-existent film/token combination returns error")
    
    def test_nda_confirm_endpoint(self):
        """POST /api/studio-access/nda-confirm records NDA agreement"""
        response = requests.post(
            f"{BASE_URL}/api/studio-access/nda-confirm/{TEST_FILM_SLUG}",
            params={'token': TEST_TOKEN},
            json={'nda_agreed': True, 'confidentiality_agreed': True}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get('script_access_granted') == True, "NDA confirm should grant script access"
        print("PASS: NDA confirmation endpoint works")
    
    def test_nda_confirm_missing_agreement(self):
        """POST /api/studio-access/nda-confirm with false agreements returns error"""
        response = requests.post(
            f"{BASE_URL}/api/studio-access/nda-confirm/{TEST_FILM_SLUG}",
            params={'token': TEST_TOKEN},
            json={'nda_agreed': False, 'confidentiality_agreed': True}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("PASS: NDA confirm with missing agreement returns 400")


class TestStudioAccessTokens:
    """Tests for admin token management endpoints"""
    
    def test_list_tokens(self):
        """GET /api/studio-access/tokens returns list of tokens"""
        response = requests.get(f"{BASE_URL}/api/studio-access/tokens")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of tokens"
        print(f"PASS: GET /api/studio-access/tokens returned {len(data)} tokens")
    
    def test_list_tokens_by_film(self):
        """GET /api/studio-access/tokens?film_id=... filters by film"""
        # First get the CROWE film ID
        film_response = requests.get(f"{BASE_URL}/api/films/by-slug/{TEST_FILM_SLUG}")
        film_id = film_response.json().get('id')
        
        response = requests.get(
            f"{BASE_URL}/api/studio-access/tokens",
            params={'film_id': film_id}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Expected list of tokens"
        # All tokens should be for the specified film
        for token in data:
            assert token.get('film_id') == film_id, "Token should be for CROWE film"
        print(f"PASS: Token filtering by film_id works")
    
    def test_access_logs_endpoint(self):
        """GET /api/studio-access/logs returns access logs"""
        response = requests.get(f"{BASE_URL}/api/studio-access/logs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Expected list of logs"
        print(f"PASS: GET /api/studio-access/logs returned {len(data)} entries")


class TestPosterImageEndpoint:
    """Test that poster images are accessible"""
    
    def test_crowe_poster_accessible(self):
        """CROWE poster image URL is accessible"""
        # Get film data first
        film_response = requests.get(f"{BASE_URL}/api/films/by-slug/{TEST_FILM_SLUG}")
        poster_url = film_response.json().get('poster_url')
        
        if poster_url:
            full_url = f"{BASE_URL}{poster_url}"
            # Use GET with stream=True to minimize download
            response = requests.get(full_url, stream=True)
            assert response.status_code == 200, f"Poster image should be accessible: {response.status_code}"
            print(f"PASS: CROWE poster image accessible at {poster_url}")
        else:
            pytest.skip("No poster URL configured for CROWE")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
