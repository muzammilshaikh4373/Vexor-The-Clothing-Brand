import requests
import sys
from datetime import datetime
import json

class VEXOREcommerceAPITester:
    def __init__(self, base_url="https://vexor-shop.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.test_phone = "1234567890"
        self.test_otp = "123456"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        request_headers = {'Content-Type': 'application/json'}
        if headers:
            request_headers.update(headers)
        if self.token:
            request_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        if data:
            print(f"   Data: {json.dumps(data, indent=2)}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=request_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=request_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=request_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=request_headers, timeout=30)

            print(f"   Response Status: {response.status_code}")
            
            # Try to parse response as JSON
            try:
                response_data = response.json()
                print(f"   Response Data: {json.dumps(response_data, indent=2)[:200]}...")
            except:
                response_data = response.text
                print(f"   Response Text: {response_data[:200]}...")

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ {name} - PASSED")
            else:
                print(f"❌ {name} - FAILED (Expected {expected_status}, got {response.status_code})")
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response_data if isinstance(response_data, dict) else str(response_data)[:200]
                })

            return success, response_data if isinstance(response_data, dict) else {}

        except Exception as e:
            print(f"❌ {name} - ERROR: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        return self.run_test("Health Check", "GET", "api/health", 200)

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "api/", 200)

    def test_auth_login(self):
        """Test login endpoint (send OTP)"""
        return self.run_test(
            "Auth - Send OTP",
            "POST", 
            "api/auth/login",
            200,
            data={"phone": self.test_phone}
        )

    def test_auth_verify_otp(self):
        """Test OTP verification"""
        success, response = self.run_test(
            "Auth - Verify OTP",
            "POST",
            "api/auth/verify-otp", 
            200,
            data={"phone": self.test_phone, "otp": self.test_otp}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   🔑 Token obtained: {self.token[:50]}...")
            return True
        return False

    def test_get_profile(self):
        """Test get user profile (requires auth)"""
        if not self.token:
            print("❌ No token available for profile test")
            return False
        return self.run_test("Auth - Get Profile", "GET", "api/auth/me", 200)

    def test_get_products(self):
        """Test get products with default pagination"""
        return self.run_test("Products - Get All", "GET", "api/products", 200)

    def test_get_products_with_pagination(self):
        """Test get products with pagination parameters"""
        return self.run_test("Products - Get with Pagination", "GET", "api/products?page=1&limit=6", 200)

    def test_get_products_with_category_filter(self):
        """Test get products with category filter"""
        return self.run_test("Products - Category Filter", "GET", "api/products?category=streetwear", 200)

    def test_get_products_with_price_filter(self):
        """Test get products with price filter"""
        return self.run_test("Products - Price Filter", "GET", "api/products?min_price=50&max_price=150", 200)

    def test_get_products_with_sorting(self):
        """Test get products with sorting"""
        return self.run_test("Products - Sort by Price Low", "GET", "api/products?sort_by=price_low", 200)

    def test_get_featured_products(self):
        """Test get featured products"""
        return self.run_test("Products - Get Featured", "GET", "api/products/featured", 200)

    def test_get_categories(self):
        """Test get product categories"""
        return self.run_test("Products - Get Categories", "GET", "api/products/categories", 200)

    def test_get_product_by_id(self):
        """Test get single product - first need to get a product ID"""
        # First get products to get a valid ID
        success, response = self.run_test("Products - Get for ID Test", "GET", "api/products?limit=1", 200)
        if success and response.get('products') and len(response['products']) > 0:
            product_id = response['products'][0]['id']
            return self.run_test("Products - Get by ID", "GET", f"api/products/{product_id}", 200)
        else:
            print("❌ Could not get product ID for single product test")
            return False

    def test_get_product_by_slug(self):
        """Test get single product by slug"""
        # First get products to get a valid slug
        success, response = self.run_test("Products - Get for Slug Test", "GET", "api/products?limit=1", 200)
        if success and response.get('products') and len(response['products']) > 0:
            product_slug = response['products'][0]['slug']
            return self.run_test("Products - Get by Slug", "GET", f"api/products/{product_slug}", 200)
        else:
            print("❌ Could not get product slug for single product test")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting VEXOR E-commerce API Tests")
        print(f"📡 Base URL: {self.base_url}")
        print(f"📱 Test Phone: {self.test_phone}")
        print(f"🔢 Test OTP: {self.test_otp}")
        print("=" * 60)

        # Health and basic tests
        self.test_health_check()
        self.test_api_root()

        # Authentication tests
        self.test_auth_login()
        self.test_auth_verify_otp()
        self.test_get_profile()

        # Product tests
        self.test_get_products()
        self.test_get_products_with_pagination()
        self.test_get_products_with_category_filter()
        self.test_get_products_with_price_filter()
        self.test_get_products_with_sorting()
        self.test_get_featured_products()
        self.test_get_categories()
        self.test_get_product_by_id()
        self.test_get_product_by_slug()

        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Tests Passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Tests Failed: {len(self.failed_tests)}/{self.tests_run}")
        
        if self.failed_tests:
            print("\n🚨 FAILED TESTS:")
            for i, failure in enumerate(self.failed_tests, 1):
                print(f"\n{i}. {failure['test']}")
                print(f"   Endpoint: {failure['endpoint']}")
                if 'expected' in failure:
                    print(f"   Expected: {failure['expected']}, Got: {failure['actual']}")
                if 'error' in failure:
                    print(f"   Error: {failure['error']}")
                if 'response' in failure:
                    print(f"   Response: {failure['response']}")

        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"\n🎯 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = VEXOREcommerceAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())