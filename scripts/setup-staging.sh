#!/bin/bash

# ============================================
# ChuloBots Staging Setup Wizard
# ============================================
# Interactive setup script for staging environment
# Usage: ./scripts/setup-staging.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Config file
CONFIG_FILE=".staging-setup.conf"

echo -e "${BLUE}"
cat << "EOF"
  _____ _           _       ____        _
 / ____| |         | |     |  _ \      | |
| |    | |__  _   _| | ___ | |_) | ___ | |_ ___
| |    | '_ \| | | | |/ _ \|  _ < / _ \| __/ __|
| |____| | | | |_| | | (_) | |_) | (_) | |_\__ \
 \_____|_| |_|\__,_|_|\___/|____/ \___/ \__|___/

    Staging Environment Setup Wizard
EOF
echo -e "${NC}\n"

# Load existing config if available
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
    echo -e "${GREEN}Loaded existing configuration${NC}\n"
fi

# ============================================
# Helper Functions
# ============================================

prompt() {
    local var_name=$1
    local prompt_text=$2
    local default_value=$3
    local current_value=${!var_name}

    if [ -n "$current_value" ]; then
        default_value=$current_value
    fi

    if [ -n "$default_value" ]; then
        read -p "$(echo -e ${CYAN}$prompt_text ${YELLOW}[$default_value]${CYAN}: ${NC})" input
        eval $var_name="${input:-$default_value}"
    else
        read -p "$(echo -e ${CYAN}$prompt_text: ${NC})" input
        eval $var_name="$input"
    fi
}

prompt_secret() {
    local var_name=$1
    local prompt_text=$2
    local current_value=${!var_name}

    if [ -n "$current_value" ]; then
        read -sp "$(echo -e ${CYAN}$prompt_text ${YELLOW}[already set]${CYAN}: ${NC})" input
        echo
        if [ -z "$input" ]; then
            eval $var_name="$current_value"
        else
            eval $var_name="$input"
        fi
    else
        read -sp "$(echo -e ${CYAN}$prompt_text: ${NC})" input
        echo
        eval $var_name="$input"
    fi
}

save_config() {
    cat > "$CONFIG_FILE" << EOF
# ChuloBots Staging Configuration
# Generated on $(date)

# Backend
BACKEND_URL="$BACKEND_URL"

# Frontend
FRONTEND_LANDING_URL="$FRONTEND_LANDING_URL"
FRONTEND_WEBAPP_URL="$FRONTEND_WEBAPP_URL"

# Blockchain
CHAIN_ID="$CHAIN_ID"
RPC_URL="$RPC_URL"

# Contract Addresses
CHULO_ADDRESS="$CHULO_ADDRESS"
SIGNAL_REGISTRY_ADDRESS="$SIGNAL_REGISTRY_ADDRESS"
VALIDATOR_STAKING_ADDRESS="$VALIDATOR_STAKING_ADDRESS"

# Railway
RAILWAY_PROJECT_ID="$RAILWAY_PROJECT_ID"

# Vercel
VERCEL_ORG_ID="$VERCEL_ORG_ID"
VERCEL_PROJECT_ID_LANDING="$VERCEL_PROJECT_ID_LANDING"
VERCEL_PROJECT_ID_WEBAPP="$VERCEL_PROJECT_ID_WEBAPP"
EOF
    echo -e "${GREEN}Configuration saved to $CONFIG_FILE${NC}"
}

# ============================================
# Step 1: Prerequisites Check
# ============================================

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}  Step 1: Prerequisites Check          ${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check Node.js
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installed:${NC} $NODE_VERSION"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    echo "Please install Node.js 20+ from https://nodejs.org"
    exit 1
fi

# Check npm
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm installed:${NC} $NPM_VERSION"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# Check git
if command -v git >/dev/null 2>&1; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✓ Git installed:${NC} $GIT_VERSION"
else
    echo -e "${RED}✗ Git not found${NC}"
    exit 1
fi

# Check for optional tools
if command -v jq >/dev/null 2>&1; then
    echo -e "${GREEN}✓ jq installed${NC}"
else
    echo -e "${YELLOW}⚠ jq not installed (recommended for JSON parsing)${NC}"
fi

if command -v gh >/dev/null 2>&1; then
    echo -e "${GREEN}✓ GitHub CLI installed${NC}"
else
    echo -e "${YELLOW}⚠ GitHub CLI not installed (recommended)${NC}"
fi

if command -v railway >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Railway CLI installed${NC}"
else
    echo -e "${YELLOW}⚠ Railway CLI not installed (will need for DB migrations)${NC}"
    echo -e "  Install: npm i -g @railway/cli"
fi

echo ""
read -p "$(echo -e ${CYAN}Continue with setup? [Y/n]: ${NC})" continue_setup
if [[ $continue_setup =~ ^[Nn]$ ]]; then
    exit 0
fi

# ============================================
# Step 2: Project Setup
# ============================================

echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}  Step 2: Project Setup                ${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check if in git repository
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${GREEN}✓ In git repository${NC}"
else
    echo -e "${RED}✗ Not in git repository${NC}"
    exit 1
fi

# Check/create staging branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "Current branch: ${YELLOW}$CURRENT_BRANCH${NC}"

if [ "$CURRENT_BRANCH" != "staging" ]; then
    read -p "$(echo -e ${CYAN}Create/checkout staging branch? [Y/n]: ${NC})" create_branch
    if [[ ! $create_branch =~ ^[Nn]$ ]]; then
        git checkout -b staging 2>/dev/null || git checkout staging
        echo -e "${GREEN}✓ On staging branch${NC}"
    fi
fi

# Install dependencies
read -p "$(echo -e ${CYAN}Install/update dependencies? [Y/n]: ${NC})" install_deps
if [[ ! $install_deps =~ ^[Nn]$ ]]; then
    echo "Installing dependencies..."
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

# ============================================
# Step 3: Smart Contracts
# ============================================

echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}  Step 3: Smart Contracts               ${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

read -p "$(echo -e ${CYAN}Deploy smart contracts? [Y/n]: ${NC})" deploy_contracts
if [[ ! $deploy_contracts =~ ^[Nn]$ ]]; then

    # Setup contracts/.env
    if [ ! -f "contracts/.env" ]; then
        echo "Creating contracts/.env..."

        prompt_secret DEPLOYER_PRIVATE_KEY "Enter deployer private key"
        prompt ARBISCAN_API_KEY "Enter Arbiscan API key"

        cat > contracts/.env << EOF
PRIVATE_KEY=$DEPLOYER_PRIVATE_KEY
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
ARBISCAN_API_KEY=$ARBISCAN_API_KEY
EOF
        echo -e "${GREEN}✓ Created contracts/.env${NC}"
    fi

    # Deploy
    echo "Deploying contracts to Arbitrum Sepolia..."
    cd contracts
    npm install
    npm run compile
    npm run deploy:sepolia
    cd ..

    # Read deployment addresses
    if [ -f "contracts/deployments/sepolia.json" ]; then
        if command -v jq >/dev/null 2>&1; then
            CHULO_ADDRESS=$(jq -r '.contracts.CHULO.address' contracts/deployments/sepolia.json)
            SIGNAL_REGISTRY_ADDRESS=$(jq -r '.contracts.SignalRegistry.address' contracts/deployments/sepolia.json)
            VALIDATOR_STAKING_ADDRESS=$(jq -r '.contracts.ValidatorStaking.address' contracts/deployments/sepolia.json)

            echo -e "\n${GREEN}✓ Contracts deployed:${NC}"
            echo -e "  CHULO: ${YELLOW}$CHULO_ADDRESS${NC}"
            echo -e "  SignalRegistry: ${YELLOW}$SIGNAL_REGISTRY_ADDRESS${NC}"
            echo -e "  ValidatorStaking: ${YELLOW}$VALIDATOR_STAKING_ADDRESS${NC}"
        fi
    fi
else
    # Manual entry
    echo "Enter deployed contract addresses:"
    prompt CHULO_ADDRESS "CHULO Token address"
    prompt SIGNAL_REGISTRY_ADDRESS "SignalRegistry address"
    prompt VALIDATOR_STAKING_ADDRESS "ValidatorStaking address"
fi

# ============================================
# Step 4: Backend Configuration
# ============================================

echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}  Step 4: Backend Configuration         ${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo "Configure backend deployment on Railway:"
echo "1. Create new Railway project"
echo "2. Add PostgreSQL database"
echo "3. Add Redis"
echo "4. Deploy backend service"
echo ""

prompt BACKEND_URL "Backend URL (from Railway)" "https://your-backend.railway.app"
prompt RAILWAY_PROJECT_ID "Railway Project ID (optional)"

echo -e "\n${YELLOW}Generate secure secrets:${NC}"
echo "JWT_SECRET=$(openssl rand -hex 32)"
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)"
echo ""
echo -e "${CYAN}Add these to Railway environment variables${NC}"

# ============================================
# Step 5: Frontend Configuration
# ============================================

echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}  Step 5: Frontend Configuration        ${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo "Configure frontend deployment on Vercel:"
echo "1. Create project for landing page (frontend/landing)"
echo "2. Create project for webapp (frontend/webapp)"
echo ""

prompt FRONTEND_LANDING_URL "Landing page URL (from Vercel)" "https://your-landing.vercel.app"
prompt FRONTEND_WEBAPP_URL "WebApp URL (from Vercel)" "https://your-webapp.vercel.app"

prompt VERCEL_ORG_ID "Vercel Organization ID (optional)"
prompt VERCEL_PROJECT_ID_LANDING "Landing project ID (optional)"
prompt VERCEL_PROJECT_ID_WEBAPP "WebApp project ID (optional)"

# ============================================
# Step 6: Save Configuration
# ============================================

echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}  Step 6: Save Configuration            ${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

CHAIN_ID="${CHAIN_ID:-421614}"
RPC_URL="${RPC_URL:-https://sepolia-rollup.arbitrum.io/rpc}"

save_config

# Create .env.staging file
echo "Creating .env.staging..."
cat > .env.staging << EOF
# Generated by setup wizard on $(date)

# Backend
BACKEND_URL=$BACKEND_URL

# Frontend
FRONTEND_LANDING_URL=$FRONTEND_LANDING_URL
FRONTEND_WEBAPP_URL=$FRONTEND_WEBAPP_URL

# Blockchain
CHAIN_ID=$CHAIN_ID
RPC_URL=$RPC_URL

# Contract Addresses
CHULO_ADDRESS=$CHULO_ADDRESS
SIGNAL_REGISTRY_ADDRESS=$SIGNAL_REGISTRY_ADDRESS
VALIDATOR_STAKING_ADDRESS=$VALIDATOR_STAKING_ADDRESS
EOF

echo -e "${GREEN}✓ Configuration saved${NC}"

# ============================================
# Step 7: Verification
# ============================================

echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}  Step 7: Verification                  ${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

read -p "$(echo -e ${CYAN}Run verification script? [Y/n]: ${NC})" run_verify
if [[ ! $run_verify =~ ^[Nn]$ ]]; then
    if [ -f "scripts/verify-staging.sh" ]; then
        export BACKEND_URL
        export FRONTEND_LANDING_URL
        export FRONTEND_WEBAPP_URL
        ./scripts/verify-staging.sh
    else
        echo -e "${YELLOW}Verification script not found${NC}"
    fi
fi

# ============================================
# Summary
# ============================================

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Setup Complete!                       ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${GREEN}Staging environment configured:${NC}"
echo -e "  Backend:  ${CYAN}$BACKEND_URL${NC}"
echo -e "  Landing:  ${CYAN}$FRONTEND_LANDING_URL${NC}"
echo -e "  WebApp:   ${CYAN}$FRONTEND_WEBAPP_URL${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Review environment variables in Railway/Vercel"
echo "  2. Run database migrations: railway run npm run db:migrate"
echo "  3. Seed database: railway run npm run db:seed:staging"
echo "  4. Test all services"
echo "  5. Setup GitHub Actions secrets (see .github/SECRETS.md)"
echo ""
echo -e "${CYAN}Documentation:${NC}"
echo "  - Full guide: STAGING_DEPLOYMENT.md"
echo "  - Checklist: DEPLOYMENT_CHECKLIST.md"
echo "  - Secrets: .github/SECRETS.md"
echo ""
echo -e "${GREEN}Happy deploying! 🚀${NC}\n"
