# ChuloBots Landing Pages - Deployment Guide

## Quick Start (Local Development)

1. **Install dependencies:**

   ```bash
   cd /Users/willnoon/Documents/GitHub/chulobots/frontend/landing
   npm install
   ```

2. **Run development server:**

   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - Main landing page: http://localhost:3000
   - Validator recruitment page: http://localhost:3000/validators

## Production Build

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Test production build locally:**
   ```bash
   npm start
   ```

## Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

1. **Install Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd /Users/willnoon/Documents/GitHub/chulobots/frontend/landing
   vercel deploy --prod
   ```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your GitHub repository
5. Configure:
   - Framework Preset: Next.js
   - Root Directory: `frontend/landing`
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Click "Deploy"

## Environment Variables (Optional)

If you need to add environment variables in production:

1. In Vercel dashboard, go to your project
2. Settings > Environment Variables
3. Add any required variables:
   ```
   NEXT_PUBLIC_API_URL=https://api.chulobots.com
   NEXT_PUBLIC_NETWORK_STATS_API=https://api.chulobots.com/stats
   ```

## DNS Configuration

Once deployed, configure your custom domain:

1. In Vercel dashboard, go to Domains
2. Add your domain (e.g., `chulobots.com`)
3. Configure DNS records:

   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: calias.vercel-dns.com
   ```

## Performance Optimization

The site is already optimized with:

- ✅ Static page generation
- ✅ Automatic code splitting
- ✅ Image optimization
- ✅ Fast page loads
- ✅ Responsive design

## Testing Before Deployment

1. **Check build succeeds:**

   ```bash
   npm run build
   ```

2. **Test all pages:**
   - Main page: http://localhost:3000
   - Validators page: http://localhost:3000/validators

3. **Verify functionality:**
   - [ ] Navigation links work
   - [ ] ROI calculator updates correctly
   - [ ] Forms and buttons are functional
   - [ ] Mobile responsive design
   - [ ] All external links open correctly

## Post-Deployment Checklist

- [ ] Main landing page loads correctly
- [ ] Validator page loads correctly
- [ ] Navigation between pages works
- [ ] ROI calculator is functional
- [ ] All links work (Discord, Docs, GitHub, etc.)
- [ ] Mobile responsive design works
- [ ] Page load speed is fast (<2 seconds)
- [ ] SEO metadata is correct
- [ ] Analytics tracking is set up (if needed)

## Monitoring

After deployment, monitor:

- Page load times (Vercel Analytics)
- Error rates (Vercel Logs)
- User conversions (validator signups)
- Traffic sources

## Rollback

If you need to rollback to a previous version:

1. In Vercel dashboard, go to Deployments
2. Find the previous working deployment
3. Click "..." menu > "Promote to Production"

## Support

If you encounter issues:

- Check Vercel logs for errors
- Verify all environment variables are set
- Ensure DNS is configured correctly
- Test locally first with `npm run build && npm start`

## Custom Domain Setup

For `chulobots.com`:

1. **Main site**: chulobots.com → Landing page
2. **Validators**: chulobots.com/validators → Validator recruitment
3. **App**: app.chulobots.com → Web application (separate deployment)
4. **Docs**: docs.chulobots.com → Documentation (separate deployment)

## Analytics Integration (Optional)

To add analytics:

1. **Vercel Analytics:**

   ```bash
   npm install @vercel/analytics
   ```

2. **Update `app/layout.tsx`:**

   ```tsx
   import { Analytics } from '@vercel/analytics/react';

   export default function RootLayout({ children }) {
     return (
       <html lang="en">
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

3. **Google Analytics (Optional):**
   Add GA4 tracking code to `app/layout.tsx`

## Cache Configuration

The site uses optimal caching via `vercel.json`:

- Static assets: 1 year cache
- HTML pages: Revalidate on demand
- API routes: No cache (if added)

## Security

Ensure security best practices:

- [ ] HTTPS enabled (automatic with Vercel)
- [ ] No sensitive data in client code
- [ ] Environment variables for secrets
- [ ] CSP headers configured (if needed)

## Next Steps After Deployment

1. Test the validator recruitment page thoroughly
2. Share the link with potential validators
3. Monitor conversion rates
4. Gather feedback and iterate
5. Consider A/B testing different CTAs
6. Add analytics to track user behavior
7. Set up monitoring alerts for downtime

## Useful Commands

```bash
# Clean build cache
npm run clean

# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Check for unused dependencies
npx depcheck
```

## Contact

For deployment issues or questions:

- Discord: discord.gg/chulobots
- Email: dev@chulobots.com
- GitHub Issues: github.com/chulobots/chulobots/issues
