#!/bin/bash
# Docker Build and Push Script for ChuloBots
# Usage: ./docker-build-push.sh [environment] [version]
# Example: ./docker-build-push.sh staging v1.0.0

set -e  # Exit on error

# Configuration
DOCKER_USERNAME="${DOCKER_USERNAME:-willnoon}"
ENVIRONMENT="${1:-staging}"
VERSION="${2:-latest}"

# Image names
BACKEND_IMAGE="${DOCKER_USERNAME}/chulobots-backend"
WEBAPP_IMAGE="${DOCKER_USERNAME}/chulobots-webapp"
LANDING_IMAGE="${DOCKER_USERNAME}/chulobots-landing"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}ChuloBots Docker Build & Push${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Environment: ${YELLOW}${ENVIRONMENT}${NC}"
echo -e "Version: ${YELLOW}${VERSION}${NC}"
echo -e "Username: ${YELLOW}${DOCKER_USERNAME}${NC}"
echo ""

# Check if logged into Docker Hub
if ! docker info | grep -q "Username: ${DOCKER_USERNAME}"; then
    echo -e "${YELLOW}Not logged into Docker Hub. Please login:${NC}"
    docker login
fi

# Function to build and push an image
build_and_push() {
    local service=$1
    local dockerfile_path=$2
    local image_name=$3
    local tag="${image_name}:${ENVIRONMENT}-${VERSION}"
    local latest_tag="${image_name}:${ENVIRONMENT}-latest"

    echo -e "\n${GREEN}Building ${service}...${NC}"
    docker build -t "${tag}" -t "${latest_tag}" -f "${dockerfile_path}" "$(dirname ${dockerfile_path})"

    echo -e "${GREEN}Pushing ${service} to Docker Hub...${NC}"
    docker push "${tag}"
    docker push "${latest_tag}"

    echo -e "${GREEN}✓ ${service} pushed successfully${NC}"
    echo -e "  - ${tag}"
    echo -e "  - ${latest_tag}"
}

# Build and push backend
build_and_push "Backend" "./backend/Dockerfile" "${BACKEND_IMAGE}"

# Build and push webapp
build_and_push "WebApp" "./frontend/webapp/Dockerfile" "${WEBAPP_IMAGE}"

# Build and push landing page
build_and_push "Landing Page" "./frontend/landing/Dockerfile" "${LANDING_IMAGE}"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}All images pushed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Deployed images:"
echo -e "  Backend:  ${BACKEND_IMAGE}:${ENVIRONMENT}-${VERSION}"
echo -e "  WebApp:   ${WEBAPP_IMAGE}:${ENVIRONMENT}-${VERSION}"
echo -e "  Landing:  ${LANDING_IMAGE}:${ENVIRONMENT}-${VERSION}"
echo ""
echo -e "To deploy these images, update your docker-compose file:"
echo -e "${YELLOW}  image: ${BACKEND_IMAGE}:${ENVIRONMENT}-${VERSION}${NC}"
echo ""
