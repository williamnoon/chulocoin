#!/bin/bash

# ============================================
# ChuloBots Staging Verification Script
# ============================================
# This script verifies that all staging services are running correctly
# Usage: ./scripts/verify-staging.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
# Override these with environment variables or command line arguments
BACKEND_URL="${BACKEND_URL:-https://your-backend.railway.app}"
FRONTEND_LANDING_URL="${FRONTEND_LANDING_URL:-https://your-landing.vercel.app}"
FRONTEND_WEBAPP_URL="${FRONTEND_WEBAPP_URL:-https://your-webapp.vercel.app}"
CHAIN_ID="${CHAIN_ID:-421614}"
RPC_URL="${RPC_URL:-https://sepolia-rollup.arbitrum.io/rpc}"

# Contract addresses (will be read from deployment file)
DEPLOYMENT_FILE="contracts/deployments/sepolia.json"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   ChuloBots Staging Verification      ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check if required commands are available
command -v curl >/dev/null 2>&1 || { echo -e "${RED}✗ curl is required but not installed.${NC}" >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo -e "${YELLOW}⚠ jq is not installed. JSON parsing will be limited.${NC}"; }

# ============================================
# 1. VERIFY SMART CONTRACTS
# ============================================
echo -e "${BLUE}1. Verifying Smart Contracts...${NC}\n"

if [ -f "$DEPLOYMENT_FILE" ]; then
    echo -e "${GREEN}✓ Deployment file found${NC}"

    if command -v jq >/dev/null 2>&1; then
        CHULO_ADDRESS=$(jq -r '.contracts.CHULO.address' "$DEPLOYMENT_FILE")
        SIGNAL_REGISTRY_ADDRESS=$(jq -r '.contracts.SignalRegistry.address' "$DEPLOYMENT_FILE")
        VALIDATOR_STAKING_ADDRESS=$(jq -r '.contracts.ValidatorStaking.address' "$DEPLOYMENT_FILE")

        echo -e "  CHULO Token:        ${GREEN}$CHULO_ADDRESS${NC}"
        echo -e "  SignalRegistry:     ${GREEN}$SIGNAL_REGISTRY_ADDRESS${NC}"
        echo -e "  ValidatorStaking:   ${GREEN}$VALIDATOR_STAKING_ADDRESS${NC}"

        # Verify contracts on blockchain
        echo -e "\n  Verifying contract deployment on blockchain..."

        # Check CHULO token
        CHULO_CHECK=$(curl -s -X POST "$RPC_URL" \
            -H "Content-Type: application/json" \
            -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$CHULO_ADDRESS\",\"latest\"],\"id\":1}" | \
            jq -r '.result')

        if [ "$CHULO_CHECK" != "0x" ] && [ ${#CHULO_CHECK} -gt 10 ]; then
            echo -e "  ${GREEN}✓ CHULO Token deployed${NC}"
        else
            echo -e "  ${RED}✗ CHULO Token not found on blockchain${NC}"
        fi

        echo -e "  View on Arbiscan: https://sepolia.arbiscan.io/address/$CHULO_ADDRESS"
    else
        echo -e "${YELLOW}  ⚠ Install jq to see contract details${NC}"
    fi
else
    echo -e "${RED}✗ Deployment file not found: $DEPLOYMENT_FILE${NC}"
    echo -e "${YELLOW}  Deploy contracts first with: cd contracts && npm run deploy:sepolia${NC}"
fi

echo ""

# ============================================
# 2. VERIFY BACKEND API
# ============================================
echo -e "${BLUE}2. Verifying Backend API...${NC}\n"

# Check health endpoint
echo -e "  Checking health endpoint..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" || echo "000")

if [ "$HEALTH_CHECK" = "200" ]; then
    echo -e "  ${GREEN}✓ Backend is healthy (HTTP $HEALTH_CHECK)${NC}"
    echo -e "  URL: ${GREEN}$BACKEND_URL${NC}"
else
    echo -e "  ${RED}✗ Backend health check failed (HTTP $HEALTH_CHECK)${NC}"
    echo -e "  ${YELLOW}  Check Railway logs for errors${NC}"
fi

# Check API endpoints
echo -e "\n  Checking API endpoints..."

# Signals endpoint
SIGNALS_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/signals/pending" || echo "000")
if [ "$SIGNALS_CHECK" = "200" ]; then
    echo -e "  ${GREEN}✓ Signals API responding (HTTP $SIGNALS_CHECK)${NC}"
else
    echo -e "  ${YELLOW}⚠ Signals API returned HTTP $SIGNALS_CHECK${NC}"
fi

# Users endpoint
USERS_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/users" || echo "000")
if [ "$USERS_CHECK" = "200" ] || [ "$USERS_CHECK" = "401" ]; then
    echo -e "  ${GREEN}✓ Users API responding (HTTP $USERS_CHECK)${NC}"
else
    echo -e "  ${YELLOW}⚠ Users API returned HTTP $USERS_CHECK${NC}"
fi

# Check database connection
echo -e "\n  Checking database connection..."
DB_CHECK=$(curl -s "$BACKEND_URL/health" | grep -o "ok" || echo "")
if [ "$DB_CHECK" = "ok" ]; then
    echo -e "  ${GREEN}✓ Database connected${NC}"
else
    echo -e "  ${RED}✗ Database connection issue${NC}"
fi

echo ""

# ============================================
# 3. VERIFY FRONTEND LANDING PAGE
# ============================================
echo -e "${BLUE}3. Verifying Frontend Landing Page...${NC}\n"

LANDING_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_LANDING_URL" || echo "000")

if [ "$LANDING_CHECK" = "200" ]; then
    echo -e "  ${GREEN}✓ Landing page accessible (HTTP $LANDING_CHECK)${NC}"
    echo -e "  URL: ${GREEN}$FRONTEND_LANDING_URL${NC}"
else
    echo -e "  ${RED}✗ Landing page not accessible (HTTP $LANDING_CHECK)${NC}"
    echo -e "  ${YELLOW}  Check Vercel deployment logs${NC}"
fi

echo ""

# ============================================
# 4. VERIFY FRONTEND WEBAPP
# ============================================
echo -e "${BLUE}4. Verifying Frontend WebApp...${NC}\n"

WEBAPP_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_WEBAPP_URL" || echo "000")

if [ "$WEBAPP_CHECK" = "200" ]; then
    echo -e "  ${GREEN}✓ WebApp accessible (HTTP $WEBAPP_CHECK)${NC}"
    echo -e "  URL: ${GREEN}$FRONTEND_WEBAPP_URL${NC}"
else
    echo -e "  ${RED}✗ WebApp not accessible (HTTP $WEBAPP_CHECK)${NC}"
    echo -e "  ${YELLOW}  Check Vercel deployment logs${NC}"
fi

echo ""

# ============================================
# 5. VERIFY WEBSOCKET CONNECTION
# ============================================
echo -e "${BLUE}5. Verifying WebSocket Connection...${NC}\n"

# Extract hostname from backend URL
WS_URL=$(echo "$BACKEND_URL" | sed 's/https:/wss:/g')

# Try to connect to WebSocket (basic check)
WS_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/socket.io/" || echo "000")

if [ "$WS_CHECK" = "200" ] || [ "$WS_CHECK" = "400" ]; then
    echo -e "  ${GREEN}✓ WebSocket endpoint responding${NC}"
    echo -e "  URL: ${GREEN}$WS_URL${NC}"
else
    echo -e "  ${YELLOW}⚠ WebSocket status unclear (HTTP $WS_CHECK)${NC}"
fi

echo ""

# ============================================
# 6. VERIFY BLOCKCHAIN CONNECTIVITY
# ============================================
echo -e "${BLUE}6. Verifying Blockchain Connectivity...${NC}\n"

# Check RPC connection
echo -e "  Checking RPC connection..."
BLOCK_NUMBER=$(curl -s -X POST "$RPC_URL" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | \
    jq -r '.result' 2>/dev/null || echo "")

if [ -n "$BLOCK_NUMBER" ] && [ "$BLOCK_NUMBER" != "null" ]; then
    BLOCK_DEC=$((16#${BLOCK_NUMBER:2}))
    echo -e "  ${GREEN}✓ RPC connected${NC}"
    echo -e "  Current block: ${GREEN}$BLOCK_DEC${NC}"
    echo -e "  Chain ID: ${GREEN}$CHAIN_ID${NC} (Arbitrum Sepolia)"
else
    echo -e "  ${RED}✗ RPC connection failed${NC}"
    echo -e "  ${YELLOW}  Check RPC_URL: $RPC_URL${NC}"
fi

echo ""

# ============================================
# 7. SUMMARY
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Verification Summary                ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Count successful checks
SUCCESS_COUNT=0
TOTAL_CHECKS=6

[ -f "$DEPLOYMENT_FILE" ] && SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
[ "$HEALTH_CHECK" = "200" ] && SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
[ "$LANDING_CHECK" = "200" ] && SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
[ "$WEBAPP_CHECK" = "200" ] && SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
[ "$WS_CHECK" = "200" ] || [ "$WS_CHECK" = "400" ] && SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
[ -n "$BLOCK_NUMBER" ] && [ "$BLOCK_NUMBER" != "null" ] && SUCCESS_COUNT=$((SUCCESS_COUNT + 1))

echo -e "Passed checks: ${GREEN}$SUCCESS_COUNT${NC} / $TOTAL_CHECKS\n"

if [ $SUCCESS_COUNT -eq $TOTAL_CHECKS ]; then
    echo -e "${GREEN}✅ All checks passed! Staging environment is healthy.${NC}\n"

    echo -e "Access your staging environment:"
    echo -e "  🌐 Landing Page: $FRONTEND_LANDING_URL"
    echo -e "  📱 WebApp:       $FRONTEND_WEBAPP_URL"
    echo -e "  🔧 Backend API:  $BACKEND_URL"
    echo -e "  ⛓️  Arbiscan:     https://sepolia.arbiscan.io"

    exit 0
elif [ $SUCCESS_COUNT -ge 4 ]; then
    echo -e "${YELLOW}⚠️  Most checks passed, but some issues detected.${NC}\n"
    echo -e "Review the warnings above and check deployment logs.\n"
    exit 0
else
    echo -e "${RED}❌ Multiple checks failed. Staging environment has issues.${NC}\n"
    echo -e "Troubleshooting steps:"
    echo -e "  1. Check Railway deployment logs"
    echo -e "  2. Check Vercel deployment logs"
    echo -e "  3. Verify environment variables are set correctly"
    echo -e "  4. Review STAGING_DEPLOYMENT.md for setup instructions"
    echo -e "  5. Run manual tests on individual services\n"
    exit 1
fi
