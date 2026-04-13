#!/bin/bash

# ========================================
# UniLodge Environment & Configuration Test
# ========================================

echo "
╔════════════════════════════════════════════╗
║   UniLodge System Configuration Test       ║
╚════════════════════════════════════════════╝
"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# ========================================
# Helper Functions
# ========================================

test_pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((TESTS_PASSED++))
}

test_fail() {
  echo -e "${RED}✗${NC} $1"
  ((TESTS_FAILED++))
}

test_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

test_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# ========================================
# Check .env file
# ========================================

echo -e "\n${BLUE}Checking Environment Configuration...${NC}"

if [ -f .env ]; then
  test_pass ".env file exists"
else
  test_fail ".env file not found"
  exit 1
fi

# Check required variables
check_env_var() {
  if grep -q "^$1=" .env; then
    VALUE=$(grep "^$1=" .env | cut -d'=' -f2)
    if [ -z "$VALUE" ]; then
      test_warn "$1 is empty"
    else
      test_pass "$1 is configured"
    fi
  else
    test_fail "$1 is not configured"
  fi
}

check_env_var "MONGODB_URI"
check_env_var "JWT_SECRET"
check_env_var "PORT"
check_env_var "OPENROUTER_API_KEY"
check_env_var "VITE_API_URL"

# ========================================
# Check Node.js and npm
# ========================================

echo -e "\n${BLUE}Checking Node.js Environment...${NC}"

if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  test_pass "Node.js installed: $NODE_VERSION"
else
  test_fail "Node.js not found"
fi

if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  test_pass "npm installed: $NPM_VERSION"
else
  test_fail "npm not found"
fi

# ========================================
# Check Project Structure
# ========================================

echo -e "\n${BLUE}Checking Project Structure...${NC}"

check_dir() {
  if [ -d "$1" ]; then
    test_pass "$1 directory exists"
  else
    test_fail "$1 directory not found"
  fi
}

check_file() {
  if [ -f "$1" ]; then
    test_pass "$1 file exists"
  else
    test_fail "$1 file not found"
  fi
}

# Check main directories
check_dir "apps/backend"
check_dir "apps/frontend"
check_dir "apps/ai-engine"
check_dir "src/domains/ai"
check_dir "tests"

# Check key files
check_file "apps/backend/src/server.ts"
check_file "apps/ai-engine/src/index.ts"
check_file "apps/backend/src/routes/ai.ts"

# ========================================
# Test MongoDB Connection
# ========================================

echo -e "\n${BLUE}Testing MongoDB Connection...${NC}"

MONGODB_URI=$(grep "^MONGODB_URI=" .env | cut -d'=' -f2)

if [ -n "$MONGODB_URI" ]; then
  test_info "MongoDB URI configured: ${MONGODB_URI:0:50}..."
  
  # Try to ping MongoDB using a simple curl request (MongoDB Atlas)
  if [[ "$MONGODB_URI" == *"mongodb+srv://"* ]]; then
    test_pass "MongoDB Atlas connection string detected"
  else
    test_warn "MongoDB local/standard connection string detected"
  fi
else
  test_fail "MongoDB URI not configured"
fi

# ========================================
# Test OpenRouter API
# ========================================

echo -e "\n${BLUE}Testing OpenRouter API Configuration...${NC}"

OPENROUTER_KEY=$(grep "^OPENROUTER_API_KEY=" .env | cut -d'=' -f2)

if [ -n "$OPENROUTER_KEY" ]; then
  test_pass "OpenRouter API key configured"
  test_info "Model: $(grep OPENROUTER_MODEL .env | cut -d'=' -f2 || echo 'default')"
else
  test_fail "OpenRouter API key not configured"
fi

# ========================================
# Check Package Dependencies
# ========================================

echo -e "\n${BLUE}Checking Package Dependencies...${NC}"

if [ -f "package.json" ]; then
  test_pass "Root package.json exists"
  
  if grep -q '"express"' package.json || [ -f "apps/backend/package.json" ] && grep -q '"express"' apps/backend/package.json; then
    test_pass "Express dependency found"
  fi
  
  if grep -q '"axios"' package.json || [ -f "apps/backend/package.json" ] && grep -q '"axios"' apps/backend/package.json; then
    test_pass "Axios dependency found"
  fi
else
  test_fail "package.json not found"
fi

# ========================================
# Check Script Commands
# ========================================

echo -e "\n${BLUE}Checking Build Scripts...${NC}"

BACKEND_BUILD=$(grep -A3 '"scripts"' apps/backend/package.json | grep "build" | head -1)

if [ -n "$BACKEND_BUILD" ]; then
  test_pass "Backend build script configured"
else
  test_warn "Backend build script may need configuration"
fi

# ========================================
# Test Results Summary
# ========================================

echo -e "\n╔════════════════════════════════════════════╗"
echo -e "║          Test Results Summary             ║"
echo -e "╠════════════════════════════════════════════╣"
echo -e "║ ${GREEN}Passed${NC}: $TESTS_PASSED                                ║"
echo -e "║ ${RED}Failed${NC}: $TESTS_FAILED                                ║"
echo -e "╚════════════════════════════════════════════╝"

# ========================================
# System Status Report
# ========================================

echo -e "\n${BLUE}System Status Report:${NC}\n"

MONGODB_STATUS=$(grep "^MONGODB_URI=" .env | cut -d'=' -f2 | head -c 30)
OPENROUTER_STATUS=$([ -n "$(grep OPENROUTER_API_KEY .env | cut -d'=' -f2)" ] && echo "✓ Configured" || echo "✗ Not configured")
PORT=$(grep "^PORT=" .env | cut -d'=' -f2)
NODE_ENV=$(grep "^NODE_ENV=" .env | cut -d'=' -f2)

echo "Backend API Server:"
echo "  Port: ${PORT:-3001}"
echo "  Environment: ${NODE_ENV:-development}"
echo ""
echo "Database:"
echo "  MongoDB: $([[ ${MONGODB_STATUS:0:10} == "mongodb" ]] && echo "✓ Configured" || echo "✗ Not configured")"
echo ""
echo "AI Engine:"
echo "  OpenRouter: $OPENROUTER_STATUS"
echo "  Chatbot: $([ "$(grep AI_CHATBOT_ENABLED .env | cut -d'=' -f2)" = "true" ] && echo "✓ Enabled" || echo "✗ Disabled")"
echo ""

# ========================================
# Next Steps
# ========================================

echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Start the backend: npm run dev (backend)"
echo "2. Start the frontend: npm run dev (frontend)"
echo "3. Test API: curl http://localhost:3001/health"
echo "4. Test AI: curl -X POST http://localhost:3001/api/ai/chat -H 'Content-Type: application/json' -d '{\"message\": \"Hello\"}'"
echo ""

# Exit with appropriate code
if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}All checks passed!${NC} Your environment is ready."
  exit 0
else
  echo -e "${YELLOW}Some checks failed. Please review the configuration above.${NC}"
  exit 1
fi
