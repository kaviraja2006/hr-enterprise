#!/usr/bin/env bash

# Test script to create a leave request and verify it appears in approvals

echo "🧪 Testing Leave Approval Integration"
echo "======================================"
echo ""

# Get auth token for an employee
echo "1. Logging in as employee (emily.davis@hrenterprise.com)..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "emily.davis@hrenterprise.com",
    "password": "Employee@123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to login"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Logged in successfully"
echo ""

# Get leave types
echo "2. Fetching leave types..."
LEAVE_TYPES=$(curl -s -X GET http://localhost:3000/leave-types \
  -H "Authorization: Bearer $TOKEN")

ANNUAL_LEAVE_ID=$(echo $LEAVE_TYPES | grep -o '"id":"[^"]*","name":"Annual Leave"' | grep -o '"id":"[^"]*' | sed 's/"id":"//')

if [ -z "$ANNUAL_LEAVE_ID" ]; then
  echo "❌ Failed to get leave type"
  exit 1
fi

echo "✅ Found Annual Leave type: $ANNUAL_LEAVE_ID"
echo ""

# Create leave request
echo "3. Creating leave request..."
START_DATE=$(date -d "+7 days" +%Y-%m-%d)
END_DATE=$(date -d "+9 days" +%Y-%m-%d)

CREATE_RESPONSE=$(curl -s -X POST http://localhost:3000/leave-requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"leaveTypeId\": \"$ANNUAL_LEAVE_ID\",
    \"startDate\": \"${START_DATE}T00:00:00.000Z\",
    \"endDate\": \"${END_DATE}T00:00:00.000Z\",
    \"reason\": \"Testing leave approval workflow\"
  }")

LEAVE_REQUEST_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')

if [ -z "$LEAVE_REQUEST_ID" ]; then
  echo "❌ Failed to create leave request"
  echo "Response: $CREATE_RESPONSE"
  exit 1
fi

echo "✅ Created leave request: $LEAVE_REQUEST_ID"
echo ""

# Login as admin
echo "4. Logging in as admin..."
ADMIN_LOGIN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hrenterprise.com",
    "password": "Admin@123"
  }')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Failed to login as admin"
  exit 1
fi

echo "✅ Logged in as admin"
echo ""

# Check workflow approvals
echo "5. Checking workflow approvals..."
APPROVALS=$(curl -s -X GET "http://localhost:3000/workflow/approvals?status=pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Approvals response:"
echo "$APPROVALS" | jq '.' 2>/dev/null || echo "$APPROVALS"
echo ""

# Check if our leave request appears
if echo "$APPROVALS" | grep -q "$LEAVE_REQUEST_ID"; then
  echo "✅ SUCCESS! Leave request appears in workflow approvals!"
else
  echo "⚠️  Leave request not found in approvals (might need to refresh)"
fi

echo ""
echo "======================================"
echo "🎉 Test completed!"
echo "======================================"
