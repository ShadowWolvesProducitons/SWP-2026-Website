"""
Test Suite: Admin Assets Library & Auto-Cataloguing Integration
Tests for:
- Assets Library CRUD operations
- Image upload auto-cataloguing to assets collection
- File upload auto-cataloguing to assets collection  
- Asset filtering by type and visibility
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestAssetsLibraryCRUD:
    """Test Assets Library API endpoints"""
    
    def test_list_assets_basic(self):
        """GET /api/assets - Should return list of assets"""
        response = requests.get(f"{BASE_URL}/api/assets")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASSED: List assets returned {len(data)} items")
    
    def test_list_assets_filter_by_type_images(self):
        """GET /api/assets?asset_type=image - Should filter by images"""
        response = requests.get(f"{BASE_URL}/api/assets?asset_type=image")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Verify all returned are images
        for asset in data:
            assert asset.get('asset_type') == 'image', f"Expected image, got {asset.get('asset_type')}"
        print(f"PASSED: Filter by images returned {len(data)} items")
    
    def test_list_assets_filter_by_type_pdfs(self):
        """GET /api/assets?asset_type=pdf - Should filter by PDFs"""
        response = requests.get(f"{BASE_URL}/api/assets?asset_type=pdf")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for asset in data:
            assert asset.get('asset_type') == 'pdf', f"Expected pdf, got {asset.get('asset_type')}"
        print(f"PASSED: Filter by PDFs returned {len(data)} items")
    
    def test_list_assets_search(self):
        """GET /api/assets?search=test - Should search assets"""
        response = requests.get(f"{BASE_URL}/api/assets?search=test")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASSED: Search returned {len(data)} items")


class TestImageUploadAutoCatalogue:
    """Test image uploads are auto-added to assets library"""
    
    def test_upload_image_with_auto_library(self):
        """POST /api/upload/image - Should auto-add to assets library"""
        # Create a test PNG image (1x1 pixel)
        test_image = io.BytesIO()
        # Minimal valid PNG
        png_header = b'\x89PNG\r\n\x1a\n'
        ihdr = b'\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde'
        idat = b'\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N'
        iend = b'\x00\x00\x00\x00IEND\xaeB`\x82'
        test_image.write(png_header + ihdr + idat + iend)
        test_image.seek(0)
        
        files = {'file': ('TEST_auto_catalogue.png', test_image, 'image/png')}
        data = {
            'auto_library': 'true',
            'source': 'test-auto-catalogue',
            'tags': 'test,auto-catalogue,integration-test'
        }
        
        response = requests.post(f"{BASE_URL}/api/upload/image", files=files, data=data)
        assert response.status_code == 200
        result = response.json()
        assert 'url' in result
        assert 'asset_id' in result
        assert result['asset_id'] is not None, "asset_id should be returned when auto_library=true"
        print(f"PASSED: Image uploaded with asset_id={result['asset_id']}")
        
        # Verify asset exists in library
        asset_response = requests.get(f"{BASE_URL}/api/assets/{result['asset_id']}")
        assert asset_response.status_code == 200
        asset = asset_response.json()
        assert asset['asset_type'] == 'image'
        assert 'test-auto-catalogue' in asset['tags']
        assert 'Auto-added from' in asset.get('notes', '')
        print(f"PASSED: Asset verified in library with tags={asset['tags']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/assets/{result['asset_id']}")
        return result['asset_id']
    
    def test_upload_image_without_auto_library(self):
        """POST /api/upload/image with auto_library=false - Should NOT add to assets"""
        test_image = io.BytesIO()
        png_header = b'\x89PNG\r\n\x1a\n'
        ihdr = b'\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde'
        idat = b'\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N'
        iend = b'\x00\x00\x00\x00IEND\xaeB`\x82'
        test_image.write(png_header + ihdr + idat + iend)
        test_image.seek(0)
        
        files = {'file': ('TEST_no_catalogue.png', test_image, 'image/png')}
        data = {'auto_library': 'false'}
        
        response = requests.post(f"{BASE_URL}/api/upload/image", files=files, data=data)
        assert response.status_code == 200
        result = response.json()
        assert 'url' in result
        # asset_id should be None when auto_library=false
        assert result['asset_id'] is None, "asset_id should be None when auto_library=false"
        print(f"PASSED: Image uploaded without asset cataloguing")
        
        # Cleanup the file via delete endpoint
        filename = result['filename']
        requests.delete(f"{BASE_URL}/api/upload/images/{filename}")


class TestFileUploadAutoCatalogue:
    """Test file uploads are auto-added to assets library"""
    
    def test_upload_file_with_auto_library(self):
        """POST /api/upload/file - Should auto-add to assets library"""
        test_file = io.BytesIO(b'Test file content for auto-cataloguing')
        test_file.seek(0)
        
        files = {'file': ('TEST_auto_file.txt', test_file, 'text/plain')}
        data = {
            'auto_library': 'true',
            'source': 'test-file-upload',
            'tags': 'test,file-upload,auto-catalogue'
        }
        
        response = requests.post(f"{BASE_URL}/api/upload/file", files=files, data=data)
        assert response.status_code == 200
        result = response.json()
        assert 'url' in result
        assert 'asset_id' in result
        assert result['asset_id'] is not None, "asset_id should be returned when auto_library=true"
        print(f"PASSED: File uploaded with asset_id={result['asset_id']}")
        
        # Verify asset exists in library
        asset_response = requests.get(f"{BASE_URL}/api/assets/{result['asset_id']}")
        assert asset_response.status_code == 200
        asset = asset_response.json()
        assert 'test-file-upload' in asset['tags']
        print(f"PASSED: File asset verified in library with tags={asset['tags']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/assets/{result['asset_id']}")
        return result['asset_id']
    
    def test_upload_pdf_file_type_detection(self):
        """POST /api/upload/file - PDF should be detected as asset_type=pdf"""
        # Create minimal PDF
        pdf_content = b'%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF'
        test_file = io.BytesIO(pdf_content)
        test_file.seek(0)
        
        files = {'file': ('TEST_pdf_type.pdf', test_file, 'application/pdf')}
        data = {
            'auto_library': 'true',
            'source': 'test-pdf-type',
            'tags': 'test,pdf-type-detection'
        }
        
        response = requests.post(f"{BASE_URL}/api/upload/file", files=files, data=data)
        assert response.status_code == 200
        result = response.json()
        assert result['asset_id'] is not None
        
        # Verify asset type is pdf
        asset_response = requests.get(f"{BASE_URL}/api/assets/{result['asset_id']}")
        assert asset_response.status_code == 200
        asset = asset_response.json()
        assert asset['asset_type'] == 'pdf', f"Expected pdf, got {asset['asset_type']}"
        print(f"PASSED: PDF file correctly detected as asset_type=pdf")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/assets/{result['asset_id']}")


class TestAssetVisibilityBadges:
    """Test asset visibility settings (Admin, Public, Investor)"""
    
    def test_update_asset_visibility(self):
        """PUT /api/assets/:id - Should update visibility"""
        # First upload an asset
        test_file = io.BytesIO(b'Test visibility')
        files = {'file': ('TEST_visibility.txt', test_file, 'text/plain')}
        data = {'auto_library': 'true', 'source': 'test-visibility'}
        
        upload_response = requests.post(f"{BASE_URL}/api/upload/file", files=files, data=data)
        assert upload_response.status_code == 200
        asset_id = upload_response.json()['asset_id']
        
        # Test visibility update to public
        update_response = requests.put(
            f"{BASE_URL}/api/assets/{asset_id}",
            json={"visibility": "public"}
        )
        assert update_response.status_code == 200
        
        # Verify visibility changed
        asset_response = requests.get(f"{BASE_URL}/api/assets/{asset_id}")
        assert asset_response.status_code == 200
        assert asset_response.json()['visibility'] == 'public'
        print("PASSED: Visibility updated to public")
        
        # Test visibility update to investor_only
        update_response = requests.put(
            f"{BASE_URL}/api/assets/{asset_id}",
            json={"visibility": "investor_only"}
        )
        assert update_response.status_code == 200
        asset_response = requests.get(f"{BASE_URL}/api/assets/{asset_id}")
        assert asset_response.json()['visibility'] == 'investor_only'
        print("PASSED: Visibility updated to investor_only")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/assets/{asset_id}")


class TestExistingTestAsset:
    """Verify the test_upload.txt asset mentioned in context exists"""
    
    def test_existing_test_asset_with_tags(self):
        """Verify test_upload.txt exists with expected tags"""
        response = requests.get(f"{BASE_URL}/api/assets?search=test_upload")
        assert response.status_code == 200
        data = response.json()
        
        # Find the test_upload.txt asset
        test_assets = [a for a in data if 'test_upload' in a.get('original_name', '')]
        if len(test_assets) > 0:
            asset = test_assets[0]
            assert 'test' in asset.get('tags', []) or 'backend-test' in asset.get('tags', [])
            print(f"PASSED: Found existing test_upload.txt with tags={asset.get('tags', [])}")
        else:
            print("INFO: test_upload.txt not found (may have been cleaned up)")


class TestAssetDeletion:
    """Test asset deletion"""
    
    def test_delete_asset(self):
        """DELETE /api/assets/:id - Should delete asset and file"""
        # First upload an asset
        test_file = io.BytesIO(b'Test delete')
        files = {'file': ('TEST_delete.txt', test_file, 'text/plain')}
        data = {'auto_library': 'true', 'source': 'test-delete'}
        
        upload_response = requests.post(f"{BASE_URL}/api/upload/file", files=files, data=data)
        assert upload_response.status_code == 200
        asset_id = upload_response.json()['asset_id']
        
        # Delete the asset
        delete_response = requests.delete(f"{BASE_URL}/api/assets/{asset_id}")
        assert delete_response.status_code == 200
        print("PASSED: Asset deleted successfully")
        
        # Verify asset no longer exists
        get_response = requests.get(f"{BASE_URL}/api/assets/{asset_id}")
        assert get_response.status_code == 404
        print("PASSED: Deleted asset returns 404")
    
    def test_delete_nonexistent_asset(self):
        """DELETE /api/assets/:id - Should return 404 for non-existent"""
        response = requests.delete(f"{BASE_URL}/api/assets/nonexistent-id-12345")
        assert response.status_code == 404
        print("PASSED: Delete nonexistent asset returns 404")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
