# Deploying to Vercel

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Vercel Account**: Sign up at https://vercel.com

## Deployment Steps

### Option 1: Via Vercel Dashboard (Recommended for first deployment)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select the `frontend/landing` directory as the root directory
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to landing directory
cd frontend/landing

# Login to Vercel
vercel login

# Deploy
vercel
```

## Configuration

Vercel auto-detects Next.js projects. The following settings are automatically configured:

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

## Environment Variables

If you need environment variables in production, add them in the Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add required variables

## Custom Domain

To add a custom domain:

1. Go to project settings in Vercel
2. Navigate to "Domains"
3. Add your domain (e.g., `chulobots.com`)
4. Update DNS records as instructed

## Automatic Deployments

Once connected, Vercel will automatically deploy:

- **Production**: When you push to `main` branch
- **Preview**: When you push to any other branch or open a PR

## Post-Deployment

After deployment, you'll receive a URL like:

- Production: `https://chulobots.vercel.app`
- Preview: `https://chulobots-<hash>.vercel.app`

Test your deployment:

1. Check that all pages load correctly
2. Verify responsive design on mobile
3. Test all CTAs and links

## Troubleshooting

**Build Fails:**

- Check build logs in Vercel dashboard
- Ensure `npm run build` works locally first

**404 Errors:**

- Verify root directory is set to `frontend/landing`
- Check that all imports use correct paths

**Styling Issues:**

- Ensure Tailwind CSS is properly configured
- Check that `postcss.config.js` is present
