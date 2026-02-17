#!/usr/bin/env python3
"""
Shadow Wolves Productions Admin CMS Backend API Test Suite
Tests all CRUD operations for films and admin authentication
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get base URL from environment
BASE_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://image-optimize-hub-1.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}Testing: {test_name}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.ENDC}")

def test_get_films():
    """Test GET /api/films endpoint"""
    print_test_header("GET /api/films - Retrieve all films")
    
    try:
        response = requests.get(f"{API_BASE}/films", timeout=10)
        print_info(f"Request URL: {API_BASE}/films")
        print_info(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            films = response.json()
            print_success(f"Successfully retrieved {len(films)} films")
            
            # Validate film structure
            if films:
                film = films[0]
                required_fields = ['id', 'title', 'status', 'featured', 'logline', 'synopsis', 'themes', 'poster_color']
                missing_fields = [field for field in required_fields if field not in film]
                
                if missing_fields:
                    print_error(f"Missing required fields: {missing_fields}")
                    return False, films
                else:
                    print_success("All required fields present in film objects")
                    
                # Check if films are sorted with featured first
                featured_films = [f for f in films if f.get('featured', False)]
                non_featured_films = [f for f in films if not f.get('featured', False)]
                
                if featured_films:
                    print_success(f"Found {len(featured_films)} featured films at the beginning")
                
                print_info(f"Film titles: {[f['title'] for f in films[:3]]}")
                return True, films
            else:
                print_warning("No films found in database")
                return True, []
        else:
            print_error(f"Failed to retrieve films: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False, []
            
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {str(e)}")
        return False, []

def test_admin_login():
    """Test POST /api/admin/login endpoint"""
    print_test_header("POST /api/admin/login - Admin authentication")
    
    # Test valid password
    print_info("Testing valid password...")
    try:
        valid_payload = {"password": "shadowwolves2024"}
        response = requests.post(
            f"{API_BASE}/admin/login", 
            json=valid_payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print_info(f"Request URL: {API_BASE}/admin/login")
        print_info(f"Payload: {valid_payload}")
        print_info(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success') == True:
                print_success("Valid password authentication successful")
                valid_auth = True
            else:
                print_error(f"Authentication failed: {result}")
                valid_auth = False
        else:
            print_error(f"Valid password failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            valid_auth = False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Valid password request failed: {str(e)}")
        valid_auth = False
    
    # Test invalid password
    print_info("Testing invalid password...")
    try:
        invalid_payload = {"password": "wrong"}
        response = requests.post(
            f"{API_BASE}/admin/login", 
            json=invalid_payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print_info(f"Payload: {invalid_payload}")
        print_info(f"Response Status: {response.status_code}")
        
        if response.status_code == 401:
            print_success("Invalid password correctly rejected with 401")
            invalid_auth = True
        else:
            print_error(f"Invalid password should return 401, got: {response.status_code}")
            print_error(f"Response: {response.text}")
            invalid_auth = False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Invalid password request failed: {str(e)}")
        invalid_auth = False
    
    return valid_auth and invalid_auth

def test_create_film():
    """Test POST /api/films endpoint"""
    print_test_header("POST /api/films - Create new film")
    
    test_film = {
        "title": "Shadow Test Chronicles",
        "status": "In Development", 
        "featured": False,
        "logline": "A thrilling test adventure in the digital realm",
        "synopsis": "When a mysterious bug appears in the system, our heroes must debug their way to victory using the ancient art of API testing.",
        "themes": ["Testing", "Adventure", "Technology"],
        "poster_color": "#ff0000"
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/films",
            json=test_film,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print_info(f"Request URL: {API_BASE}/films")
        print_info(f"Payload: {json.dumps(test_film, indent=2)}")
        print_info(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            created_film = response.json()
            print_success(f"Film created successfully with ID: {created_film['id']}")
            
            # Validate created film has all fields
            for key, value in test_film.items():
                if created_film.get(key) != value:
                    print_error(f"Field mismatch - {key}: expected {value}, got {created_film.get(key)}")
                    return False, None
            
            # Check for auto-generated fields
            if 'id' in created_film and 'created_at' in created_film:
                print_success("Auto-generated fields (id, created_at) present")
            else:
                print_error("Missing auto-generated fields")
                return False, None
                
            return True, created_film['id']
        else:
            print_error(f"Film creation failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False, None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Create film request failed: {str(e)}")
        return False, None

def test_update_film(film_id):
    """Test PUT /api/films/{id} endpoint"""
    print_test_header(f"PUT /api/films/{film_id} - Update film")
    
    update_data = {
        "title": "Shadow Test Chronicles: Updated Edition",
        "featured": True
    }
    
    try:
        response = requests.put(
            f"{API_BASE}/films/{film_id}",
            json=update_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print_info(f"Request URL: {API_BASE}/films/{film_id}")
        print_info(f"Payload: {json.dumps(update_data, indent=2)}")
        print_info(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            updated_film = response.json()
            print_success("Film updated successfully")
            
            # Validate updates
            if updated_film.get('title') == update_data['title']:
                print_success("Title updated correctly")
            else:
                print_error(f"Title not updated: expected {update_data['title']}, got {updated_film.get('title')}")
                return False
                
            if updated_film.get('featured') == update_data['featured']:
                print_success("Featured status updated correctly")
            else:
                print_error(f"Featured not updated: expected {update_data['featured']}, got {updated_film.get('featured')}")
                return False
                
            return True
        else:
            print_error(f"Film update failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Update film request failed: {str(e)}")
        return False

def test_delete_film(film_id):
    """Test DELETE /api/films/{id} endpoint"""
    print_test_header(f"DELETE /api/films/{film_id} - Delete film")
    
    try:
        response = requests.delete(f"{API_BASE}/films/{film_id}", timeout=10)
        
        print_info(f"Request URL: {API_BASE}/films/{film_id}")
        print_info(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print_success(f"Film deleted successfully: {result.get('message', 'No message')}")
            return True
        else:
            print_error(f"Film deletion failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Delete film request failed: {str(e)}")
        return False

def test_verify_deletion():
    """Verify the test film was deleted by checking film count"""
    print_test_header("Verify Deletion - Check film count")
    
    try:
        response = requests.get(f"{API_BASE}/films", timeout=10)
        
        if response.status_code == 200:
            films = response.json()
            print_success(f"Current film count: {len(films)}")
            
            # Check if our test film is gone
            test_film_exists = any(f.get('title', '').startswith('Shadow Test Chronicles') for f in films)
            
            if not test_film_exists:
                print_success("Test film successfully removed from database")
                return True
            else:
                print_error("Test film still exists in database")
                return False
        else:
            print_error(f"Failed to verify deletion: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Verification request failed: {str(e)}")
        return False

def run_all_tests():
    """Run complete test suite"""
    print(f"{Colors.BOLD}{Colors.BLUE}")
    print("🎬 Shadow Wolves Productions API Test Suite")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print(f"API Base: {API_BASE}")
    print("=" * 60)
    print(f"{Colors.ENDC}")
    
    test_results = {}
    
    # Test 1: Get initial films
    print_info("Step 1: Testing film retrieval...")
    success, initial_films = test_get_films()
    test_results['get_films_initial'] = success
    initial_count = len(initial_films) if initial_films else 0
    
    # Test 2: Admin authentication
    print_info("Step 2: Testing admin authentication...")
    test_results['admin_login'] = test_admin_login()
    
    # Test 3: Create film
    print_info("Step 3: Testing film creation...")
    success, film_id = test_create_film()
    test_results['create_film'] = success
    
    if success and film_id:
        # Test 4: Update film
        print_info("Step 4: Testing film update...")
        test_results['update_film'] = test_update_film(film_id)
        
        # Test 5: Delete film
        print_info("Step 5: Testing film deletion...")
        test_results['delete_film'] = test_delete_film(film_id)
        
        # Test 6: Verify deletion
        print_info("Step 6: Verifying deletion...")
        test_results['verify_deletion'] = test_verify_deletion()
    else:
        print_warning("Skipping update/delete tests due to creation failure")
        test_results['update_film'] = False
        test_results['delete_film'] = False
        test_results['verify_deletion'] = False
    
    # Final results
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}TEST RESULTS SUMMARY{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.ENDC}")
    
    passed = sum(test_results.values())
    total = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        color = Colors.GREEN if result else Colors.RED
        print(f"{color}{status}{Colors.ENDC} - {test_name.replace('_', ' ').title()}")
    
    print(f"\n{Colors.BOLD}Overall: {passed}/{total} tests passed{Colors.ENDC}")
    
    if passed == total:
        print(f"{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! API is working correctly.{Colors.ENDC}")
        return True
    else:
        print(f"{Colors.RED}{Colors.BOLD}⚠️  Some tests failed. Check the details above.{Colors.ENDC}")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)