"""
Full Regression Test Suite for Shadow Wolves Productions
Tests: Films, Armory, Blog, Contact, Admin Assets, Upload APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestPublicAPIs:
    """Test all public-facing API endpoints"""
    
    def test_root_api(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Root API: {data['message']}")
    
    def test_get_films(self):
        """Test GET /api/films endpoint"""
        response = requests.get(f"{BASE_URL}/api/films")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/films: {len(data)} films returned")
        if data:
            # Verify film structure
            film = data[0]
            assert "id" in film
            assert "title" in film
            print(f"  First film: {film.get('title', 'N/A')}")
    
    def test_get_armory_items(self):
        """Test GET /api/den-items (Armory products)"""
        response = requests.get(f"{BASE_URL}/api/den-items")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/den-items: {len(data)} armory items returned")
        if data:
            item = data[0]
            assert "id" in item
            assert "title" in item
            print(f"  First item: {item.get('title', 'N/A')} ({item.get('item_type', 'N/A')})")
    
    def test_get_blog_posts(self):
        """Test GET /api/blog (Blog posts)"""
        response = requests.get(f"{BASE_URL}/api/blog")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/blog: {len(data)} blog posts returned")
        if data:
            post = data[0]
            assert "id" in post
            assert "title" in post
            print(f"  First post: {post.get('title', 'N/A')}")
    
    def test_post_contact_submit(self):
        """Test POST /api/contact (Contact form)"""
        payload = {
            "name": "TEST_Regression_Contact",
            "email": "test.regression@example.com",
            "message": "This is a regression test submission",
            "service": "general"
        }
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert response.status_code in [200, 201]
        data = response.json()
        print(f"✓ POST /api/contact: Success")
        assert "id" in data or "message" in data


class TestAdminAPIs:
    """Test admin API endpoints"""
    
    def test_get_admin_assets(self):
        """Test GET /api/assets (Admin assets library)"""
        response = requests.get(f"{BASE_URL}/api/assets")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/assets: {len(data)} assets returned")
        if data:
            asset = data[0]
            assert "id" in asset
            print(f"  First asset: {asset.get('original_name', asset.get('filename', 'N/A'))}")
    
    def test_filter_assets_by_type(self):
        """Test asset filtering by type"""
        for asset_type in ['image', 'pdf']:
            response = requests.get(f"{BASE_URL}/api/assets?asset_type={asset_type}")
            assert response.status_code == 200
            data = response.json()
            print(f"✓ GET /api/assets?asset_type={asset_type}: {len(data)} assets")
    
    def test_get_admin_contact_submissions(self):
        """Test GET /api/contact (Admin - view submissions)"""
        response = requests.get(f"{BASE_URL}/api/contact")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/contact: {len(data)} submissions returned")
    
    def test_get_admin_submissions(self):
        """Test GET /api/submissions (Work with us submissions)"""
        response = requests.get(f"{BASE_URL}/api/submissions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/submissions: {len(data)} submissions returned")


class TestUploadAPIs:
    """Test file upload endpoints"""
    
    def test_upload_image_endpoint_exists(self):
        """Test POST /api/upload/image endpoint exists"""
        # Create a small test image in memory
        import io
        test_content = b'\x89PNG\r\n\x1a\n' + b'\x00' * 100  # Minimal PNG-like bytes
        
        # We can't actually test upload without a real file, but we can verify endpoint exists
        files = {'file': ('test.png', io.BytesIO(test_content), 'image/png')}
        data = {'source': 'regression-test', 'tags': 'test,regression'}
        
        response = requests.post(f"{BASE_URL}/api/upload/image", files=files, data=data)
        # Either success or validation error (not 404)
        assert response.status_code in [200, 201, 400, 422]
        print(f"✓ POST /api/upload/image: Endpoint responds (status: {response.status_code})")
    
    def test_serve_uploaded_image(self):
        """Test GET /api/upload/images/{filename} (serve header banner)"""
        response = requests.get(f"{BASE_URL}/api/upload/images/header-banner.png")
        # Should return image or 404 if not exists
        assert response.status_code in [200, 404]
        if response.status_code == 200:
            assert 'image' in response.headers.get('content-type', '')
            print("✓ GET /api/upload/images/header-banner.png: Image served successfully")
        else:
            print("⚠ GET /api/upload/images/header-banner.png: File not found (may need upload)")


class TestInvestorAPIs:
    """Test investor portal API endpoints"""
    
    def test_get_investor_projects(self):
        """Test GET /api/investors/projects (Public slate)"""
        response = requests.get(f"{BASE_URL}/api/investors/projects")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/investors/projects: {len(data)} projects returned")
    
    def test_get_investor_blog_posts(self):
        """Test GET /api/investors/blog/posts (Investor updates)"""
        response = requests.get(f"{BASE_URL}/api/investors/blog/posts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/investors/blog/posts: {len(data)} posts returned")
    
    def test_validate_investor_password(self):
        """Test POST /api/investors/auth (Password validation)"""
        # Test with correct password
        response = requests.post(
            f"{BASE_URL}/api/investors/auth",
            json={"password": "investor2024"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✓ POST /api/investors/auth: Correct password validated")
        
        # Test with wrong password
        response_wrong = requests.post(
            f"{BASE_URL}/api/investors/auth",
            json={"password": "wrongpassword"}
        )
        assert response_wrong.status_code == 200
        data = response_wrong.json()
        assert data.get("success") == False
        print("✓ Wrong password correctly rejected")


class TestAdminAuthentication:
    """Test admin authentication"""
    
    def test_validate_admin_password(self):
        """Test POST /api/admin/login"""
        # Test with correct password
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "shadowwolves2024"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✓ POST /api/admin/login: Admin password validated")
        
        # Test with wrong password
        response_wrong = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "wrongpassword"}
        )
        assert response_wrong.status_code == 401
        print("✓ Wrong admin password correctly rejected")


class TestNewsletterAPI:
    """Test newsletter subscription API"""
    
    def test_newsletter_subscribe(self):
        """Test POST /api/newsletter"""
        payload = {
            "email": f"test.regression.{os.urandom(4).hex()}@example.com",
            "source": "regression_test",
            "lead_magnet": "test"
        }
        response = requests.post(f"{BASE_URL}/api/newsletter", json=payload)
        # Could be 200/201 for success, 400 for already subscribed, etc.
        assert response.status_code in [200, 201, 400, 409]
        print(f"✓ POST /api/newsletter: Status {response.status_code}")


class TestCineConnectAPI:
    """Test CineConnect interest API"""
    
    def test_cineconnect_interest(self):
        """Test POST /api/contact/cineconnect-interest"""
        payload = {
            "name": "TEST_Regression_CineConnect",
            "email": f"test.cineconnect.{os.urandom(4).hex()}@example.com"
        }
        response = requests.post(f"{BASE_URL}/api/contact/cineconnect-interest", json=payload)
        assert response.status_code in [200, 201]
        print(f"✓ POST /api/contact/cineconnect-interest: Success")


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
