# Vercel Deployment Guide

This guide covers deploying both frontend applications (landing page and web app) to Vercel.

## Applications

- **Landing Page**: `/frontend/landing` (Next.js)
- **Web App**: `/frontend/webapp` (Vite React)

## Prerequisites

- Vercel account
- Vercel CLI installed: `npm i -g vercel`
- Git repository connected to Vercel

## Initial Setup

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Project

From the project root:

```bash
vercel link
```

## Environment Variables

### Landing Page Environment Variables

Create these in Vercel dashboard for the landing page project:

**Staging:**

```
NEXT_PUBLIC_API_URL=https://api-staging.chulobots.com
NEXT_PUBLIC_WEBAPP_URL=https://app-staging.chulobots.com
```

**Production:**

```
NEXT_PUBLIC_API_URL=https://api.chulobots.com
NEXT_PUBLIC_WEBAPP_URL=https://app.chulobots.com
```

### Web App Environment Variables

Create these in Vercel dashboard for the web app project:

**Staging:**

```
VITE_API_URL=https://api-staging.chulobots.com
VITE_WS_URL=wss://api-staging.chulobots.com
VITE_CHULO_ADDRESS=0x... (Your Arbitrum Sepolia contract address)
VITE_SIGNAL_REGISTRY_ADDRESS=0x... (Your Arbitrum Sepolia registry address)
VITE_CHAIN_ID=421614
```

**Production:**

```
VITE_API_URL=https://api.chulobots.com
VITE_WS_URL=wss://api.chulobots.com
VITE_CHULO_ADDRESS=0x... (Your Arbitrum One contract address)
VITE_SIGNAL_REGISTRY_ADDRESS=0x... (Your Arbitrum One registry address)
VITE_CHAIN_ID=42161
```

## Deployment Commands

### Deploy Landing Page

From `/frontend/landing`:

**Development (Preview):**

```bash
vercel
```

**Staging:**

```bash
vercel --prod
```

**Production:**

```bash
vercel --prod
```

### Deploy Web App

From `/frontend/webapp`:

**Development (Preview):**

```bash
vercel
```

**Staging:**

```bash
vercel --prod
```

**Production:**

```bash
vercel --prod
```

## Setting Up Multiple Environments

### Option 1: Separate Vercel Projects

Create two separate Vercel projects for each application:

1. **Landing Page**
   - `chulobots-landing-staging` - Preview deployments + staging branch
   - `chulobots-landing-production` - Production deployments

2. **Web App**
   - `chulobots-app-staging` - Preview deployments + staging branch
   - `chulobots-app-production` - Production deployments

Configure different environment variables for each project.

### Option 2: Single Project with Environment Detection

Use Vercel's built-in environment variables:

- `VERCEL_ENV` - One of: `production`, `preview`, or `development`
- `VERCEL_GIT_COMMIT_REF` - Branch name

Configure different values for each environment in Vercel dashboard.

## Vercel Dashboard Configuration

### Landing Page (Next.js)

1. Go to Vercel Dashboard > Your Project > Settings
2. **Build & Development Settings:**
   - Framework Preset: `Next.js`
   - Root Directory: `frontend/landing`
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)
   - Install Command: `npm install`

3. **Environment Variables:**
   - Add all `NEXT_PUBLIC_*` variables
   - Set appropriate values for Production/Preview/Development

### Web App (Vite React)

1. Go to Vercel Dashboard > Your Project > Settings
2. **Build & Development Settings:**
   - Framework Preset: `Vite`
   - Root Directory: `frontend/webapp`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables:**
   - Add all `VITE_*` variables
   - Set appropriate values for Production/Preview/Development

## Automatic Deployments

### Git Integration

Vercel automatically deploys when you push to connected branches:

- **Production Branch**: `main` or `master`
  - Deploys to production domain
  - Uses production environment variables

- **Preview Branches**: Any other branch
  - Deploys to preview URL
  - Uses preview environment variables

### Branch Configuration

Configure in Vercel Dashboard > Settings > Git:

- **Production Branch**: `main`
- **Preview Branches**: All other branches
- **Ignored Build Step**: Optional - use for monorepo path filtering

## Custom Domains

### Landing Page

1. Go to Vercel Dashboard > Your Project > Settings > Domains
2. Add domains:
   - Production: `chulobots.com`, `www.chulobots.com`
   - Staging: `staging.chulobots.com`

### Web App

1. Go to Vercel Dashboard > Your Project > Settings > Domains
2. Add domains:
   - Production: `app.chulobots.com`
   - Staging: `app-staging.chulobots.com`

## Monorepo Configuration

Since this is a monorepo, you'll need to deploy each frontend application separately.

### Method 1: Individual Vercel Projects (Recommended)

Create separate Vercel projects for each application:

1. Import project twice in Vercel
2. Set different root directories for each:
   - Landing: `frontend/landing`
   - Web App: `frontend/webapp`

### Method 2: Root vercel.json (Current Setup)

The `vercel.json` in the project root is configured to handle both applications:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/landing/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "frontend/webapp/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ]
}
```

## Build Scripts

Both applications have the correct build scripts configured:

### Landing Page (`frontend/landing/package.json`)

```json
{
  "scripts": {
    "build": "next build"
  }
}
```

### Web App (`frontend/webapp/package.json`)

```json
{
  "scripts": {
    "build": "tsc && vite build"
  }
}
```

## Troubleshooting

### Build Failures

**Issue**: Build fails with "Cannot find module"

- **Solution**: Ensure all dependencies are in `dependencies`, not `devDependencies`

**Issue**: Environment variables not available

- **Solution**: Ensure variables are prefixed correctly:
  - Next.js: `NEXT_PUBLIC_*`
  - Vite: `VITE_*`

### Deployment Issues

**Issue**: Wrong application deployed

- **Solution**: Check root directory setting in Vercel project settings

**Issue**: Static files not found (Vite)

- **Solution**: Verify `distDir: "dist"` in vercel.json and output directory in Vercel settings

### Environment Variable Issues

**Issue**: Variables not updating

- **Solution**: Redeploy after changing environment variables in Vercel dashboard

**Issue**: Variables showing as undefined

- **Solution**: Make sure to prefix variables correctly and restart dev server

## Testing Deployments

### Preview Deployments

1. Create a new branch
2. Push changes
3. Vercel automatically creates preview deployment
4. Test using preview URL

### Production Deployments

1. Merge to `main` branch
2. Vercel automatically deploys to production
3. Monitor deployment in Vercel dashboard

## CLI Deployment Workflow

### Quick Deploy (Preview)

```bash
# Landing page
cd frontend/landing
vercel

# Web app
cd frontend/webapp
vercel
```

### Production Deploy

```bash
# Landing page
cd frontend/landing
vercel --prod

# Web app
cd frontend/webapp
vercel --prod
```

### Deploy with Environment

```bash
# Deploy to specific environment
vercel --env NEXT_PUBLIC_API_URL=https://custom-api.com
```

## Rollback

If you need to rollback a deployment:

1. Go to Vercel Dashboard > Deployments
2. Find the previous working deployment
3. Click "Promote to Production"

Or use CLI:

```bash
vercel rollback [deployment-url]
```

## Monitoring

Monitor your deployments in the Vercel dashboard:

- **Overview**: Build status, deployment history
- **Analytics**: Page views, performance metrics
- **Logs**: Build logs, function logs
- **Speed Insights**: Performance monitoring

## Best Practices

1. **Use Preview Deployments**: Test changes before merging to production
2. **Environment Variables**: Never commit sensitive variables to git
3. **Custom Domains**: Set up proper DNS configuration
4. **Monitoring**: Use Vercel Analytics for performance insights
5. **Build Cache**: Vercel caches dependencies for faster builds
6. **Automatic Deployments**: Connect Git for automatic deployments
7. **Review Apps**: Share preview URLs with team for review

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vite on Vercel](https://vercel.com/docs/frameworks/vite)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
