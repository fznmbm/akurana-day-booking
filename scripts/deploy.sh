#!/bin/bash

# ============================================
# DEPLOYMENT SCRIPT FOR EVENT BOOKING SYSTEM
# ============================================
# Usage: ./scripts/deploy.sh [organization-id] [environment]
# Examples:
#   ./scripts/deploy.sh ahhc production
#   ./scripts/deploy.sh islahtrust production
#   ./scripts/deploy.sh ahhc staging

set -e # Exit on error

# ============================================
# COLORS FOR OUTPUT
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# VALIDATE ARGUMENTS
# ============================================
ORG_ID=$1
ENVIRONMENT=${2:-production}

if [ -z "$ORG_ID" ]; then
  echo -e "${RED}❌ Error: Organization ID required${NC}"
  echo ""
  echo -e "${YELLOW}Usage:${NC}"
  echo "  ./scripts/deploy.sh [org-id] [environment]"
  echo ""
  echo -e "${BLUE}Available Organizations:${NC}"
  echo "  - ahhc"
  echo "  - islahtrust"
  echo ""
  echo -e "${BLUE}Examples:${NC}"
  echo "  ./scripts/deploy.sh ahhc production"
  echo "  ./scripts/deploy.sh islahtrust production"
  exit 1
fi

# ============================================
# CHECK IF ENV FILE EXISTS
# ============================================
ENV_FILE=".env.${ENVIRONMENT}.${ORG_ID}"

if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}❌ Error: Environment file not found: $ENV_FILE${NC}"
  echo ""
  echo -e "${YELLOW}Please create the environment file first:${NC}"
  echo "  cp .env.production.ahhc .env.${ENVIRONMENT}.${ORG_ID}"
  echo "  # Then edit the file with correct values"
  exit 1
fi

# ============================================
# DISPLAY DEPLOYMENT INFO
# ============================================
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}🚀 DEPLOYING EVENT BOOKING SYSTEM${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${YELLOW}Organization:${NC} $ORG_ID"
echo -e "${YELLOW}Environment:${NC} $ENVIRONMENT"
echo -e "${YELLOW}Env File:${NC} $ENV_FILE"
echo ""

# ============================================
# CONFIRMATION
# ============================================
read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}⏸️  Deployment cancelled${NC}"
  exit 1
fi

# ============================================
# COPY ENVIRONMENT FILE
# ============================================
echo ""
echo -e "${BLUE}📋 Copying environment variables...${NC}"
cp "$ENV_FILE" .env.local
echo -e "${GREEN}✅ Environment file copied${NC}"

# ============================================
# BUILD CHECK (Optional)
# ============================================
echo ""
echo -e "${BLUE}🔨 Running build check...${NC}"
if npm run build; then
  echo -e "${GREEN}✅ Build successful${NC}"
else
  echo -e "${RED}❌ Build failed${NC}"
  echo -e "${YELLOW}Fix the errors above before deploying${NC}"
  exit 1
fi

# ============================================
# DEPLOY TO VERCEL
# ============================================
echo ""
echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"

if [ "$ENVIRONMENT" = "production" ]; then
  # Production deployment
  vercel --prod --yes --name "event-booking-${ORG_ID}"
else
  # Staging/preview deployment
  vercel --yes --name "event-booking-${ORG_ID}"
fi

# ============================================
# CLEANUP
# ============================================
echo ""
echo -e "${BLUE}🧹 Cleaning up...${NC}"
rm -f .env.local
echo -e "${GREEN}✅ Cleanup complete${NC}"

# ============================================
# SUCCESS MESSAGE
# ============================================
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${YELLOW}Organization:${NC} $ORG_ID"
echo -e "${YELLOW}Environment:${NC} $ENVIRONMENT"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Visit your Vercel dashboard to get the deployment URL"
echo "  2. Test the deployment thoroughly"
echo "  3. Configure custom domain (if needed)"
echo ""
