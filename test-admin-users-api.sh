#!/bin/bash

echo "=========================================="
echo "TEST: Admin User Management API"
echo "=========================================="
echo ""

# Ambil base URL dari env atau gunakan default
API_URL="${API_BASE_URL:-http://localhost:8080/api/v1}"
echo "API Base URL: $API_URL"
echo ""

# Login sebagai admin
echo "1. Login sebagai admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // .token // .data.token // empty' 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ ERROR: Failed to get token from login response"
  exit 1
fi

echo "✅ Token obtained: ${TOKEN:0:50}..."
echo ""

# Test get users list
echo "2. Testing GET /admin/users..."
USERS_RESPONSE=$(curl -s -X GET "$API_URL/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Users Response:"
echo "$USERS_RESPONSE" | jq '.' 2>/dev/null || echo "$USERS_RESPONSE"
echo ""

# Check if response has items
ITEMS_COUNT=$(echo "$USERS_RESPONSE" | jq '.data.items | length' 2>/dev/null)
TOTAL_ITEMS=$(echo "$USERS_RESPONSE" | jq '.data.total_items' 2>/dev/null)

echo "Items in response: $ITEMS_COUNT"
echo "Total items: $TOTAL_ITEMS"
echo ""

if [ "$ITEMS_COUNT" = "null" ] || [ -z "$ITEMS_COUNT" ]; then
  echo "❌ ERROR: No 'items' field in response"
  echo "Response structure:"
  echo "$USERS_RESPONSE" | jq 'keys' 2>/dev/null || echo "Could not parse JSON"
else
  echo "✅ Response has items field"
  if [ "$ITEMS_COUNT" -eq 0 ]; then
    echo "⚠️  WARNING: Items array is empty"
  else
    echo "✅ Found $ITEMS_COUNT users"
    echo ""
    echo "Sample user:"
    echo "$USERS_RESPONSE" | jq '.data.items[0]' 2>/dev/null
  fi
fi

echo ""
echo "=========================================="
echo "Debug Info:"
echo "=========================================="
echo "Request URL: $API_URL/admin/users?page=1&limit=20"
echo "Authorization header: Bearer ${TOKEN:0:30}..."
echo ""

# Test with different query parameters
echo "3. Testing with filters..."
FILTERED_RESPONSE=$(curl -s -X GET "$API_URL/admin/users?page=1&limit=20&active=true" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

FILTERED_COUNT=$(echo "$FILTERED_RESPONSE" | jq '.data.items | length' 2>/dev/null)
echo "Active users count: $FILTERED_COUNT"
echo ""

# Test direct database query via admin endpoint
echo "4. Testing other admin endpoints..."
ELECTIONS_RESPONSE=$(curl -s -X GET "$API_URL/admin/elections" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Elections endpoint works: $(echo $ELECTIONS_RESPONSE | jq 'has("items")' 2>/dev/null)"
echo ""

echo "=========================================="
echo "Test Complete"
echo "=========================================="
