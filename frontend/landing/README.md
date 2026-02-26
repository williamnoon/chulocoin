# ChuloBots Landing Pages

This is the landing page and marketing site for ChuloBots, built with Next.js 14, React, and TailwindCSS.

## Pages

### Main Landing Page (`/`)
The main homepage showcasing the ChuloBots platform:
- Hero section with value proposition
- How It Works section
- User tier comparison
- Validator recruitment CTA
- Download section for CLI miner
- Full navigation and footer

### Validator Recruitment Page (`/validators`)
Comprehensive landing page for recruiting validators:
- Hero with live terminal demonstration
- Real-time network statistics
- Interactive ROI calculator
- Step-by-step "How It Works" timeline
- Tier comparison (Tier 1, 2, 3)
- Hardware and technical requirements
- Benefits section
- Validator testimonials
- Getting started guide
- Extensive FAQ section
- Download section

## Features

### Interactive Components
- **ROI Calculator**: Real-time earnings calculator with adjustable stake amount and CHULO price
- **Live Stats**: Animated network statistics (validators, total staked, uptime)
- **Terminal Demo**: Simulated validator terminal showing real-time earnings
- **Responsive Design**: Fully responsive across mobile, tablet, and desktop

### Design System
- **Color Scheme**: Matrix/terminal aesthetic with green (#22c55e) on dark backgrounds
- **Typography**: Monospace fonts for technical elements, Inter for body text
- **Components**: Reusable React components with TypeScript
- **Styling**: TailwindCSS utility classes with custom theme

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The site will be available at http://localhost:3000

## Project Structure

```
frontend/landing/
├── app/
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Main landing page
│   ├── globals.css          # Global styles
│   └── validators/
│       └── page.tsx         # Validator recruitment page
├── components/
│   ├── Hero.tsx             # Main hero component
│   ├── HowItWorks.tsx       # How it works section
│   ├── TierComparison.tsx   # User tiers comparison
│   ├── Download.tsx         # Download section
│   └── validators/          # Validator page components
│       ├── ValidatorHero.tsx
│       ├── NetworkStats.tsx
│       ├── ROICalculator.tsx
│       ├── ValidatorHowItWorks.tsx
│       ├── ValidatorTiers.tsx
│       ├── Requirements.tsx
│       ├── Benefits.tsx
│       ├── Testimonials.tsx
│       ├── FAQ.tsx
│       └── GettingStarted.tsx
└── public/                  # Static assets
```

## Deployment

The site is configured for deployment to Vercel:

```bash
# Deploy to Vercel
vercel deploy --prod
```

The `vercel.json` configuration ensures proper routing and optimization.

## Key Metrics (Validator Page)

### Fee Structures
- **Tier 1**: 10,000 CHULO, 100 validations/day, 0% burn pool, ~$525/month
- **Tier 2**: 50,000 CHULO, 500 validations/day, 2% burn pool, ~$4,275/month (RECOMMENDED)
- **Tier 3**: 200,000 CHULO, unlimited validations, 5% burn pool, ~$25,650/month

### Validation Economics
- Validation reward: 0.25 CHULO per validation
- Default CHULO price: $0.30 (adjustable in calculator)
- Operating costs: ~$74/month (VPS + RPC APIs)

## Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI**: React 18
- **Deployment**: Vercel

## Environment Variables

Create a `.env.local` file for local development:

```bash
# API endpoints (optional)
NEXT_PUBLIC_API_URL=https://api.chulobots.com
```

## SEO Optimization

Both pages include:
- Optimized metadata (title, description, keywords)
- Open Graph tags for social sharing
- Semantic HTML structure
- Fast page load times
- Mobile-responsive design

## Future Enhancements

- [ ] Connect ROI calculator to live network data
- [ ] Add validator leaderboard
- [ ] Implement real-time network statistics API
- [ ] Add video tutorials
- [ ] Create blog/documentation pages
- [ ] Add multi-language support
- [ ] Implement analytics tracking
- [ ] Add testimonial submission form

## Contributing

When adding new pages or components:
1. Follow the existing component structure
2. Use TypeScript for type safety
3. Keep components small and reusable
4. Follow the design system (colors, typography, spacing)
5. Ensure mobile responsiveness
6. Add proper metadata for SEO

## License

© 2026 ChuloBots. All rights reserved.
