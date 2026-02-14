#!/bin/bash

echo "Testing Samantha Birthday API"
echo "=============================="
echo ""

BASE_URL="http://localhost:3000"

# Test health endpoint
echo "1. Testing /health endpoint..."
curl -s $BASE_URL/health | jq .
echo -e "\n"

# Get all birthdays (should be empty)
echo "2. Getting all birthdays (should be empty)..."
curl -s $BASE_URL/birthdays | jq .
echo -e "\n"

# Create a birthday entry
echo "3. Creating a birthday entry for John Doe..."
JOHN_ID=$(curl -s -X POST $BASE_URL/birthdays \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "date_of_birth": "1990-05-15",
    "phone": "+1-555-0123",
    "address": "123 Main St, Springfield"
  }' | jq -r '.id')
echo "Created John with ID: $JOHN_ID"
echo -e "\n"

# Create another birthday entry
echo "4. Creating a birthday entry for Jane Smith..."
JANE_ID=$(curl -s -X POST $BASE_URL/birthdays \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "date_of_birth": "1985-12-25",
    "phone": "+1-555-0456",
    "address": "456 Oak Ave, Springfield"
  }' | jq -r '.id')
echo "Created Jane with ID: $JANE_ID"
echo -e "\n"

# Get all birthdays
echo "5. Getting all birthdays..."
curl -s $BASE_URL/birthdays | jq .
echo -e "\n"

# Get a specific birthday
echo "6. Getting John's birthday by ID..."
curl -s $BASE_URL/birthdays/$JOHN_ID | jq .
echo -e "\n"

# Update a birthday
echo "7. Updating John's phone number..."
curl -s -X PUT $BASE_URL/birthdays/$JOHN_ID \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1-555-9999"
  }' | jq .
echo -e "\n"

# Get upcoming birthdays
echo "8. Getting upcoming birthdays (next 30 days)..."
curl -s "$BASE_URL/birthdays/upcoming?days=30" | jq .
echo -e "\n"

# Delete a birthday
echo "9. Deleting Jane's birthday..."
curl -s -X DELETE $BASE_URL/birthdays/$JANE_ID
echo "Deleted successfully"
echo -e "\n"

# Get all birthdays again
echo "10. Getting all birthdays (should only have John)..."
curl -s $BASE_URL/birthdays | jq .
echo -e "\n"

echo "=============================="
echo "Testing complete!"
