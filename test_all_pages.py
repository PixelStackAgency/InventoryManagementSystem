#!/usr/bin/env python3
"""Comprehensive test of all InventoryPro pages and APIs"""

import requests
import json
import time

BASE_URL = "http://localhost:3000"
API_BASE = f"{BASE_URL}/api"

# Colors for output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"

def log_success(message):
    print(f"{GREEN}✓ {message}{RESET}")

def log_error(message):
    print(f"{RED}✗ {message}{RESET}")

def log_info(message):
    print(f"{BLUE}ℹ {message}{RESET}")

def log_warning(message):
    print(f"{YELLOW}⚠ {message}{RESET}")

def test_login():
    """Test login functionality"""
    log_info("Testing Login...")
    try:
        response = requests.post(f"{API_BASE}/auth/login", json={
            "username": "superadmin",
            "password": "superadmin123"
        })
        if response.status_code == 200:
            log_success("Login successful")
            return response.json().get("token")
        else:
            log_error(f"Login failed: {response.status_code}")
            return None
    except Exception as e:
        log_error(f"Login error: {e}")
        return None

def test_api_endpoints(token=None):
    """Test all API endpoints"""
    log_info("\nTesting API Endpoints...")
    
    endpoints = [
        ("GET", "/products", "Products"),
        ("GET", "/sales", "Sales"),
        ("GET", "/purchases", "Purchases"),
        ("GET", "/customers", "Customers"),
        ("GET", "/suppliers", "Suppliers"),
        ("GET", "/users", "Users/Staff"),
        ("GET", "/permissions", "Permissions"),
        ("GET", "/settings", "Settings"),
        ("GET", "/auth/me", "Current User"),
    ]
    
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    results = {}
    for method, endpoint, name in endpoints:
        try:
            url = f"{API_BASE}{endpoint}"
            if method == "GET":
                response = requests.get(url, headers=headers)
            else:
                response = requests.post(url, headers=headers)
            
            if response.status_code in [200, 401, 403]:
                results[name] = True
                log_success(f"{name} API: {response.status_code}")
            else:
                results[name] = False
                log_error(f"{name} API: {response.status_code}")
        except Exception as e:
            results[name] = False
            log_error(f"{name} API error: {e}")
    
    return results

def test_pages():
    """Test that pages are accessible"""
    log_info("\nTesting Page Accessibility...")
    
    pages = [
        ("/", "Dashboard"),
        ("/login", "Login"),
        ("/products", "Products"),
        ("/sales", "Sales"),
        ("/purchases", "Purchases"),
        ("/customers", "Customers"),
        ("/suppliers", "Suppliers"),
        ("/staff", "Staff Management"),
        ("/settings", "Settings"),
    ]
    
    results = {}
    for path, name in pages:
        try:
            response = requests.get(f"{BASE_URL}{path}", allow_redirects=False)
            # Pages return 200 or redirect (301/302)
            if response.status_code in [200, 301, 302, 307, 308]:
                results[name] = True
                log_success(f"{name}: Accessible")
            else:
                results[name] = False
                log_error(f"{name}: {response.status_code}")
        except Exception as e:
            results[name] = False
            log_error(f"{name} error: {e}")
    
    return results

def test_crud_operations(token=None):
    """Test basic CRUD operations"""
    log_info("\nTesting CRUD Operations...")
    
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    results = {}
    
    # Test Product Creation
    try:
        product_data = {
            "name": f"Test Product {time.time()}",
            "sku": f"TEST-{int(time.time())}",
            "quantity": 100,
            "minStock": 10,
            "purchasePrice": 50,
            "sellingPrice": 100,
            "categoryId": 1
        }
        response = requests.post(f"{API_BASE}/products", 
                                 json=product_data, 
                                 headers=headers)
        if response.status_code in [200, 201]:
            results["Product Creation"] = True
            log_success("Product Creation: OK")
        else:
            results["Product Creation"] = False
            log_error(f"Product Creation: {response.status_code}")
    except Exception as e:
        results["Product Creation"] = False
        log_error(f"Product Creation error: {e}")
    
    # Test Customer Creation
    try:
        customer_data = {
            "name": f"Test Customer {time.time()}",
            "email": f"test{int(time.time())}@example.com",
            "phone": "1234567890"
        }
        response = requests.post(f"{API_BASE}/customers", 
                                 json=customer_data, 
                                 headers=headers)
        if response.status_code in [200, 201]:
            results["Customer Creation"] = True
            log_success("Customer Creation: OK")
        else:
            results["Customer Creation"] = False
            log_error(f"Customer Creation: {response.status_code}")
    except Exception as e:
        results["Customer Creation"] = False
        log_error(f"Customer Creation error: {e}")
    
    # Test Supplier Creation
    try:
        supplier_data = {
            "name": f"Test Supplier {time.time()}",
            "email": f"supplier{int(time.time())}@example.com",
            "phone": "0987654321"
        }
        response = requests.post(f"{API_BASE}/suppliers", 
                                 json=supplier_data, 
                                 headers=headers)
        if response.status_code in [200, 201]:
            results["Supplier Creation"] = True
            log_success("Supplier Creation: OK")
        else:
            results["Supplier Creation"] = False
            log_error(f"Supplier Creation: {response.status_code}")
    except Exception as e:
        results["Supplier Creation"] = False
        log_error(f"Supplier Creation error: {e}")
    
    return results

def main():
    print(f"\n{BLUE}{'='*60}")
    print(f"  InventoryPro - Comprehensive Test Suite")
    print(f"{'='*60}{RESET}\n")
    
    # Test login first
    token = test_login()
    
    if not token:
        log_warning("Could not get authentication token. Testing public endpoints only.")
    
    # Run all tests
    page_results = test_pages()
    api_results = test_api_endpoints(token)
    crud_results = test_crud_operations(token)
    
    # Summary
    log_info("\n" + "="*60)
    log_info("TEST SUMMARY")
    log_info("="*60)
    
    total_tests = len(page_results) + len(api_results) + len(crud_results)
    passed = sum([1 for v in list(page_results.values()) + list(api_results.values()) + list(crud_results.values()) if v])
    
    print(f"\n{BLUE}Pages: {sum(page_results.values())}/{len(page_results)} passed{RESET}")
    for name, passed_test in page_results.items():
        status = f"{GREEN}✓{RESET}" if passed_test else f"{RED}✗{RESET}"
        print(f"  {status} {name}")
    
    print(f"\n{BLUE}APIs: {sum(api_results.values())}/{len(api_results)} passed{RESET}")
    for name, passed_test in api_results.items():
        status = f"{GREEN}✓{RESET}" if passed_test else f"{RED}✗{RESET}"
        print(f"  {status} {name}")
    
    print(f"\n{BLUE}CRUD: {sum(crud_results.values())}/{len(crud_results)} passed{RESET}")
    for name, passed_test in crud_results.items():
        status = f"{GREEN}✓{RESET}" if passed_test else f"{RED}✗{RESET}"
        print(f"  {status} {name}")
    
    print(f"\n{BLUE}Overall: {passed}/{total_tests} tests passed ({int(passed/total_tests*100)}%){RESET}\n")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        log_error(f"Test suite error: {e}")
