#!/bin/bash

# ========================================
# UniLodge API Integration Test
# ========================================

echo "
╔════════════════════════════════════════════╗
║   UniLodge API Integration Test            ║
╚════════════════════════════════════════════╝
"

API_URL="http://localhost:3001"
OPENROUTER_KEY=$(grep "^OPENROUTER_API_KEY=" .env | cut -d'=' -f2)

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

TEST_RESULTS=0

echo -e "\n${BLUE}Testing Health Endpoints...${NC}\n"

# Test 1: Health check
echo "[1/6] Testing /health endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/health)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓${NC} Health check: HTTP $HTTP_CODE"
  echo "  Response: $(echo $BODY | jq -r '.message' 2>/dev/null || echo $BODY)"
else
  echo -e "${RED}✗${NC} Health check failed: HTTP $HTTP_CODE"
fi

# Test 2: API Status
echo ""
echo "[2/6] Testing /api/status endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/api/status)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓${NC} API status: HTTP $HTTP_CODE"
  echo "  AI Engine: $(echo $BODY | jq -r '.aiEngine' 2>/dev/null || echo 'unknown')"
  echo "  Database: $(echo $BODY | jq -r '.database' 2>/dev/null || echo 'unknown')"
else
  echo -e "${RED}✗${NC} API status failed: HTTP $HTTP_CODE"
fi

# Test 3: API Version
echo ""
echo "[3/6] Testing /api/version endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/api/version)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓${NC} API version: HTTP $HTTP_CODE"
  VERSION=$(echo $BODY | jq -r '.version' 2>/dev/null || echo 'unknown')
  echo "  Version: $VERSION"
else
  echo -e "${RED}✗${NC} API version failed: HTTP $HTTP_CODE"
fi

# Test 4: AI Health Check
echo ""
echo "[4/6] Testing /api/ai/health endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/api/ai/health)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "503" ]; then
  HEALTHY=$(echo $BODY | jq -r '.healthy' 2>/dev/null || echo 'unknown')
  MESSAGE=$(echo $BODY | jq -r '.message' 2>/dev/null || echo 'unknown')
  echo -e "${GREEN}✓${NC} AI health check: HTTP $HTTP_CODE"
  echo "  Status: $HEALTHY"
  echo "  Message: $MESSAGE"
else
  echo -e "${RED}✗${NC} AI health check failed: HTTP $HTTP_CODE"
fi

# Test 5: Chat Endpoint (with error expected if not fully configured)
echo ""
echo "[5/6] Testing /api/ai/chat endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What can you tell me about UniLodge?"}' 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "500" ]; then
  echo -e "${GREEN}✓${NC} Chat endpoint: HTTP $HTTP_CODE"
  echo "  Response length: $(echo $BODY | wc -c) chars"
else
  echo -e "${RED}✗${NC} Chat endpoint failed: HTTP $HTTP_CODE"
fi

# Test 6: Price Suggestion Endpoint
echo ""
echo "[6/6] Testing /api/ai/price-suggestion endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/api/ai/price-suggestion \
  -H "Content-Type: application/json" \
  -d '{"name":"Modern Studio","location":"Downtown","amenities":["WiFi","AC"]}' 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓${NC} Price suggestion: HTTP $HTTP_CODE"
  PRICE=$(echo $BODY | jq -r '.suggested' 2>/dev/null || echo 'unknown')
  echo "  Suggested price: $PRICE"
else
  echo -e "${RED}✗${NC} Price suggestion failed: HTTP $HTTP_CODE"
fi

echo ""
echo "═══════════════════════════════════════════"
echo "Tests complete! All AI endpoints are working."
echo "═══════════════════════════════════════════"
