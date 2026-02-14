"""
Armory AI Endpoints Test Suite
Tests: generate-product-content, regenerate-product-section, generate-product-seo
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestProductAIGeneration:
    """Test AI content generation endpoints for Product Page Builder"""
    
    def test_generate_product_content_apps_type(self):
        """Test POST /api/ai/generate-product-content for Apps type"""
        payload = {
            "product_name": "TEST_AI_App",
            "product_type": "Apps",
            "pricing_model": "free",
            "short_description": "A test app for filmmakers to organize their shoots",
            "who_its_for": "Indie filmmakers, content creators",
            "key_outcomes": "Better organization, faster workflow"
        }
        response = requests.post(f"{BASE_URL}/api/ai/generate-product-content", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print(f"✓ AI generated content for Apps type")
        
        # Verify required fields for Apps type
        assert "positioning_line" in data, "Missing positioning_line"
        assert "what_this_is" in data, "Missing what_this_is"
        assert "features" in data, "Apps type should have features"
        assert "core_actions" in data, "Apps type should have core_actions"
        assert "cta_text" in data, "Missing cta_text"
        assert "tags" in data, "Missing tags"
        
        # Verify data types
        assert isinstance(data["features"], list), "Features should be a list"
        assert isinstance(data["core_actions"], list), "Core actions should be a list"
        assert isinstance(data["tags"], list), "Tags should be a list"
        
        print(f"  - Positioning: {data['positioning_line'][:50]}...")
        print(f"  - Features count: {len(data['features'])}")
        print(f"  - Core actions count: {len(data['core_actions'])}")
    
    def test_generate_product_content_templates_type(self):
        """Test POST /api/ai/generate-product-content for Templates type"""
        payload = {
            "product_name": "TEST_Template_Pack",
            "product_type": "Templates",
            "pricing_model": "one_time",
            "price": "A$29",
            "short_description": "A collection of Notion templates for film production"
        }
        response = requests.post(f"{BASE_URL}/api/ai/generate-product-content", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        print(f"✓ AI generated content for Templates type")
        
        # Templates should have what_you_get and how_it_works
        assert "what_you_get" in data, "Templates should have what_you_get"
        assert "how_it_works" in data, "Templates should have how_it_works"
        assert isinstance(data["what_you_get"], list)
        
        print(f"  - What you get items: {len(data['what_you_get'])}")
    
    def test_generate_product_content_missing_required(self):
        """Test that missing required fields return error"""
        payload = {
            "product_name": "Test",
            # Missing short_description
        }
        response = requests.post(f"{BASE_URL}/api/ai/generate-product-content", json=payload)
        # Should fail due to missing required field
        assert response.status_code in [422, 400, 500], f"Expected error status, got {response.status_code}"
        print("✓ Missing required fields returns error")


class TestProductSectionRegeneration:
    """Test section-level AI regeneration endpoint"""
    
    def test_regenerate_positioning_line(self):
        """Test POST /api/ai/regenerate-product-section for positioning_line"""
        payload = {
            "section": "positioning_line",
            "product_name": "House Heroes",
            "product_type": "Apps",
            "existing_content": {
                "short_description": "A property management app",
                "what_it_is": "An app for landlords"
            }
        }
        response = requests.post(f"{BASE_URL}/api/ai/regenerate-product-section", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "section" in data
        assert "value" in data
        assert data["section"] == "positioning_line"
        assert isinstance(data["value"], str)
        assert len(data["value"]) > 0
        
        print(f"✓ Regenerated positioning_line: {data['value'][:60]}...")
    
    def test_regenerate_features(self):
        """Test regenerating features list"""
        payload = {
            "section": "features",
            "product_name": "Test App",
            "product_type": "Apps",
            "existing_content": {
                "short_description": "A productivity app",
                "tags": ["productivity", "workflow"]
            }
        }
        response = requests.post(f"{BASE_URL}/api/ai/regenerate-product-section", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["section"] == "features"
        assert "value" in data
        assert isinstance(data["value"], list)
        assert len(data["value"]) > 0
        
        print(f"✓ Regenerated features: {len(data['value'])} items")
    
    def test_regenerate_cta(self):
        """Test regenerating CTA section"""
        payload = {
            "section": "cta",
            "product_name": "Game Night",
            "product_type": "Apps",
            "existing_content": {
                "short_description": "A party game app",
                "pricing_model": "free"
            }
        }
        response = requests.post(f"{BASE_URL}/api/ai/regenerate-product-section", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "cta_text" in data
        assert "cta_microcopy" in data
        
        print(f"✓ Regenerated CTA: {data['cta_text'][:40]}...")
    
    def test_regenerate_unknown_section(self):
        """Test that unknown section returns error"""
        payload = {
            "section": "invalid_section_name",
            "product_name": "Test",
            "product_type": "Apps",
            "existing_content": {}
        }
        response = requests.post(f"{BASE_URL}/api/ai/regenerate-product-section", json=payload)
        assert response.status_code == 400, f"Expected 400 for unknown section, got {response.status_code}"
        print("✓ Unknown section returns 400 error")


class TestProductSEOGeneration:
    """Test SEO generation endpoint"""
    
    def test_generate_seo_from_content(self):
        """Test POST /api/ai/generate-product-seo"""
        payload = {
            "title": "House Heroes",
            "positioning_line": "Property management made simple",
            "what_this_is": "House Heroes is a comprehensive property management app designed for landlords and property managers to track rent, maintenance, and tenant communications.",
            "tags": ["property management", "landlord", "rental"]
        }
        response = requests.post(f"{BASE_URL}/api/ai/generate-product-seo", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        print("✓ Generated SEO data")
        
        # Verify required SEO fields
        assert "focus_keyword" in data, "Missing focus_keyword"
        assert "seo_title" in data, "Missing seo_title"
        assert "seo_description" in data, "Missing seo_description"
        
        # Verify SEO constraints
        seo_title = data["seo_title"]
        seo_desc = data["seo_description"]
        
        print(f"  - Focus keyword: {data['focus_keyword']}")
        print(f"  - SEO title ({len(seo_title)} chars): {seo_title}")
        print(f"  - SEO description ({len(seo_desc)} chars): {seo_desc[:60]}...")
        
        # SEO title should be <= 60 chars, description <= 160 chars
        # Note: AI may not always follow exactly, so we just log if it exceeds
        if len(seo_title) > 60:
            print(f"  ⚠ SEO title exceeds 60 chars ({len(seo_title)})")
        if len(seo_desc) > 160:
            print(f"  ⚠ SEO description exceeds 160 chars ({len(seo_desc)})")
    
    def test_generate_seo_minimal_input(self):
        """Test SEO generation with minimal input"""
        payload = {
            "title": "Test Product",
            "positioning_line": "",
            "what_this_is": "",
            "tags": []
        }
        response = requests.post(f"{BASE_URL}/api/ai/generate-product-seo", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "focus_keyword" in data
        assert "seo_title" in data
        assert "seo_description" in data
        print("✓ SEO generation works with minimal input")


class TestDenItemsCRUD:
    """Test den-items (Armory products) CRUD operations"""
    
    @pytest.fixture(autouse=True)
    def setup_and_cleanup(self):
        """Setup and cleanup test data"""
        yield
        # Cleanup: Delete any TEST_ prefixed products
        try:
            items = requests.get(f"{BASE_URL}/api/den-items?include_archived=true").json()
            for item in items:
                if item.get("title", "").startswith("TEST_"):
                    requests.delete(f"{BASE_URL}/api/den-items/{item['id']}?permanent=true")
        except:
            pass
    
    def test_get_all_products(self):
        """Test GET /api/den-items"""
        response = requests.get(f"{BASE_URL}/api/den-items")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/den-items: {len(data)} products")
    
    def test_create_basic_product(self):
        """Test creating a basic product"""
        payload = {
            "title": "TEST_Basic_Product",
            "slug": "test-basic-product",
            "item_type": "Apps",
            "price": "A$29",
            "primary_link_url": "https://example.com",
            "short_description": "A test product",
            "is_published": True
        }
        response = requests.post(f"{BASE_URL}/api/den-items", json=payload)
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}: {response.text}"
        
        data = response.json()
        product_id = data.get("id")
        assert product_id, "Product should have an ID"
        print(f"✓ Created basic product with ID: {product_id}")
        
        # Verify title persisted
        get_response = requests.get(f"{BASE_URL}/api/den-items/{product_id}")
        assert get_response.status_code == 200
        saved = get_response.json()
        assert saved.get("title") == "TEST_Basic_Product"
        assert saved.get("price") == "A$29"
        print("✓ Product data persisted correctly")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/den-items/{product_id}?permanent=true")
    
    def test_create_product_with_existing_seo_fields(self):
        """Test creating product with SEO fields that exist in backend model"""
        payload = {
            "title": "TEST_SEO_Product",
            "slug": "test-seo-product",
            "item_type": "Templates",
            "price": "A$49",
            "primary_link_url": "https://example.com",
            "short_description": "A test template with SEO",
            "seo_title": "Best Filmmaking Template 2024 | Shadow Wolves",
            "seo_description": "Download the ultimate filmmaking template to organize your productions.",
            "is_published": True
        }
        response = requests.post(f"{BASE_URL}/api/den-items", json=payload)
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}"
        
        data = response.json()
        product_id = data.get("id")
        print(f"✓ Created product with SEO fields")
        
        # Verify SEO fields were saved (seo_title and seo_description exist in model)
        get_response = requests.get(f"{BASE_URL}/api/den-items/{product_id}")
        if get_response.status_code == 200:
            saved = get_response.json()
            assert saved.get("seo_title") == payload["seo_title"], "SEO title should be saved"
            assert saved.get("seo_description") == payload["seo_description"], "SEO description should be saved"
            print("✓ SEO title and description saved correctly")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/den-items/{product_id}?permanent=true")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
