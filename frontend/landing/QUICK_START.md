# ChuloBots Landing Pages - Quick Start Guide

## Get Started in 3 Minutes

### 1. Install & Run (30 seconds)

```bash
cd /Users/willnoon/Documents/GitHub/chulobots/frontend/landing
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

### 2. View Pages

- **Main Landing**: http://localhost:3000
- **Validator Recruitment**: http://localhost:3000/validators

### 3. Deploy to Production (1 minute)

```bash
npm run build          # Test build
vercel deploy --prod   # Deploy to Vercel
```

---

## What You Get

### Main Landing Page (`/`)
- Hero section
- How it works
- User tiers
- Validator CTA
- Downloads
- Full navigation

### Validator Page (`/validators`)
- Live terminal demo
- Interactive ROI calculator
- Tier comparison
- Requirements
- FAQ (8 questions)
- Getting started guide
- Testimonials

---

## ROI Calculator Features

The calculator automatically:
- Adjusts tier based on stake amount
- Calculates daily/monthly/annual earnings
- Shows validation rewards + burn pool share
- Displays ROI percentage
- Calculates break-even time

**Try it:**
1. Go to `/validators`
2. Scroll to "Calculate Your Earnings"
3. Adjust the slider (10k - 200k CHULO)
4. See real-time earnings update

---

## Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| ValidatorHero | `/components/validators/` | Hero with terminal |
| ROICalculator | `/components/validators/` | Interactive calculator |
| ValidatorTiers | `/components/validators/` | Tier comparison |
| FAQ | `/components/validators/` | Q&A accordion |

---

## Customization

### Change CHULO Price Default
Edit `ROICalculator.tsx` line 18:
```tsx
const [chuloPrice, setChuloPrice] = useState(0.30); // Change this
```

### Update Network Stats
Edit `NetworkStats.tsx` lines 7-9:
```tsx
const [stats, setStats] = useState({
  validators: 87,      // Update this
  totalStaked: 4.2,    // Update this
  uptime: 99.8,        // Update this
});
```

### Modify Tier Economics
Edit `ValidatorTiers.tsx` starting at line 1.

---

## Common Tasks

### Add a New Section to Validator Page
1. Create component in `/components/validators/YourComponent.tsx`
2. Import in `/app/validators/page.tsx`
3. Add to page: `<YourComponent />`

### Update Colors
Edit `tailwind.config.ts`:
```ts
chulo: {
  light: '#4ade80',    // Light green
  DEFAULT: '#22c55e',  // Main green
  dark: '#16a34a',     // Dark green
}
```

### Change Footer Links
Edit bottom of `/app/validators/page.tsx` or `/app/page.tsx`.

---

## Troubleshooting

### Build Fails
```bash
npm run clean
npm install
npm run build
```

### TypeScript Errors
```bash
npx tsc --noEmit
```

### ESLint Errors
```bash
npm run lint
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

---

## Files You'll Edit Most

1. **Content Updates**:
   - `/components/validators/FAQ.tsx` - Update questions
   - `/components/validators/Testimonials.tsx` - Add testimonials
   - `/components/validators/ValidatorTiers.tsx` - Update pricing

2. **Design Changes**:
   - `/app/globals.css` - Global styles
   - `tailwind.config.ts` - Theme colors

3. **Page Structure**:
   - `/app/page.tsx` - Main landing
   - `/app/validators/page.tsx` - Validator page

---

## Quick Commands

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build           # Build for production
npm start               # Run production build

# Maintenance
npm run clean           # Clean .next cache
npm run lint            # Check code quality

# Deployment
vercel deploy           # Deploy preview
vercel deploy --prod    # Deploy to production
```

---

## Resources

- **Full README**: See `README.md`
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`
- **Summary**: See `LANDING_PAGES_SUMMARY.md`
- **Next.js Docs**: https://nextjs.org/docs
- **TailwindCSS Docs**: https://tailwindcss.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

## Need Help?

1. Check console for errors: Open browser DevTools (F12)
2. Check terminal for build errors
3. Read error messages carefully
4. Search Next.js docs for specific issues
5. Ask in ChuloBots Discord: discord.gg/chulobots

---

## Key URLs (After Deployment)

- **Live Site**: https://chulobots.com
- **Validators**: https://chulobots.com/validators
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## Success Checklist

- [x] ✅ Build passes
- [x] ✅ Both pages load correctly
- [x] ✅ ROI calculator works
- [x] ✅ Navigation functions
- [x] ✅ Mobile responsive
- [ ] 🚀 Deploy to production
- [ ] 🔍 Test in production
- [ ] 📊 Set up analytics
- [ ] 📢 Share with community

---

**You're ready to go! 🚀**

Start the dev server and visit http://localhost:3000/validators to see the validator recruitment page.
