# Yellow House Frontend Deployment Guide

## Overview

The Yellow House frontend is deployed on Vercel with automatic builds on git push to the main branch. The deployment is configured for optimal performance, caching, and security.

## Deployment Configuration

### Vercel Setup

**Project Details:**
- Project ID: `prj_EAqQOPVFz0aOzGZrchucfzq6Yzsw`
- Organization ID: `team_EkSUdcw1gpZaooX5UU46MRPS`
- Project Name: `yellow-house`

**Build Configuration:**
- Build Command: `pnpm build`
- Output Directory: `packages/frontend/dist`
- Node.js Version: 20.x (default)

### Environment Variables

Configure the following environment variable in Vercel dashboard:

```
VITE_API_URL=https://api.yellowhouse.app  # (or your backend API URL)
```

The frontend uses this URL to make API calls. If not set, it defaults to `http://localhost:3001` for local development.

### Caching Strategy

The deployment includes optimized cache headers:

- **Static Assets** (`/assets/*`): 1 year cache
  - `Cache-Control: public, max-age=31536000, immutable`
  - Applies to JavaScript, CSS, images, fonts (versioned by Vite)

- **HTML** (`/index.html`): No cache
  - `Cache-Control: public, max-age=0, must-revalidate`
  - Ensures users always get the latest version

### Security Headers

The following security headers are configured:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Build Optimization

The frontend uses Vite for fast builds and optimal bundling:

```bash
pnpm build
```

This produces:
- Minified JavaScript/CSS
- Tree-shaked unused code
- Optimized images
- Source maps for debugging

## Deployment Steps

### Initial Setup

1. **GitHub Integration**
   - Vercel is already connected to the GitHub repository
   - Go to Vercel dashboard and select "Add project"
   - Connect the Yellow House repository
   - Configure git branch: `main` (for production)

2. **Environment Variables**
   - Set `VITE_API_URL` in Vercel project settings
   - Value: Your backend API URL (e.g., `https://api.yellowhouse.app`)

3. **Custom Domain**
   - Go to Vercel project settings → Domains
   - Add `yellowhouse.app` (or your custom domain)
   - Configure DNS settings as shown in Vercel

### Automatic Deployment

Every push to the `main` branch triggers a new deployment:

1. Git push to main
2. Vercel receives webhook notification
3. Vercel runs build command (`pnpm build`)
4. Frontend assets are deployed to CDN
5. Automatic HTTPS certificate renewal

### Manual Deployment

To trigger a manual deployment from the Vercel CLI:

```bash
vercel deploy --prod
```

## Monitoring & Performance

### Lighthouse Scores

Performance targets:
- Mobile: >90
- Desktop: >90

Check scores in Vercel dashboard → Analytics

### Error Monitoring

Frontend errors are logged to browser console and can be monitored via:
- Vercel Analytics dashboard
- Browser error logs
- Sentry integration (optional)

### API Connectivity

If the backend API is unreachable:
- Frontend displays error message
- User can retry the operation
- Check `VITE_API_URL` environment variable

## Rollback

To rollback to a previous deployment:

1. Go to Vercel project dashboard
2. Find the deployment you want to rollback to
3. Click "..." → "Rollback to this Deployment"
4. Confirm the rollback

The previous version will be re-deployed immediately.

## PR Preview Deployments

When creating a PR:
1. Vercel automatically creates a preview deployment
2. A comment is added to the PR with the preview URL
3. Test the changes before merging
4. Preview is deleted when PR is closed

## Troubleshooting

### Build Fails

1. Check Vercel build logs
2. Ensure all dependencies are installed
3. Run `pnpm install && pnpm build` locally to test
4. Check for TypeScript errors: `pnpm type-check`

### API Calls Fail

1. Verify `VITE_API_URL` is set correctly in Vercel
2. Check backend API is running and accessible
3. Review browser network tab for failed requests
4. Check CORS configuration on backend

### Performance Issues

1. Check Lighthouse scores in Vercel Analytics
2. Review bundle size: `pnpm build --report`
3. Optimize large images with WebP format
4. Minimize CSS/JS in build

## Continuous Integration

### GitHub Actions

The repository includes CI/CD checks:
- `pnpm lint` - Code style check
- `pnpm type-check` - TypeScript validation
- `pnpm test` - Unit tests
- `pnpm build` - Production build

All checks must pass before merging to main.

## Next Steps

1. Configure `VITE_API_URL` in Vercel dashboard
2. Test deployment with a PR
3. Configure custom domain `yellowhouse.app`
4. Set up monitoring and alerts
5. Document API health checks
