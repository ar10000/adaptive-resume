# Deployment Guide for Vercel

This guide will help you deploy the Adaptive Resume application to Vercel.

## Prerequisites

- A Vercel account ([sign up here](https://vercel.com/signup))
- A GitHub account (for connecting your repository)
- An Anthropic API key ([get one here](https://console.anthropic.com/))

## Step 1: Prepare Your Repository

1. Ensure all your code is committed and pushed to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. Verify your `.gitignore` includes:
   - `.env.local`
   - `.env*.local`
   - `node_modules`
   - `.next`

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Configure environment variables (see Step 3)
6. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

## Step 3: Configure Environment Variables

In your Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add the following variable:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Your Anthropic API key
   - **Environment**: Production, Preview, Development (select all)

3. Click "Save"

## Step 4: Configure Build Settings

Vercel should auto-detect Next.js, but verify:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

## Step 5: Configure Node.js Version

1. Go to **Settings** → **General**
2. Set **Node.js Version** to `18.x` or higher
3. Save changes

## Step 6: Handle Rate Limiting (Production)

The current rate limiting uses in-memory storage. For production:

### Option A: Use Vercel Edge Config or Redis

1. Set up a Redis instance (e.g., Upstash, Redis Cloud)
2. Update `lib/rateLimit.ts` to use Redis
3. Add Redis connection string to environment variables

### Option B: Use Vercel's Built-in Rate Limiting

Consider using Vercel's Edge Middleware for rate limiting.

## Step 7: Set Up Analytics (Optional)

For production analytics:

1. Consider integrating with:
   - Vercel Analytics
   - PostHog
   - Google Analytics
   - Custom analytics service

2. Update `lib/analytics.ts` to use your chosen service

## Step 8: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL certificates are automatically provisioned

## Step 9: Monitor and Optimize

### Performance Monitoring

- Use Vercel Analytics to monitor:
  - Page load times
  - API response times
  - Error rates

### Error Tracking

- Set up error tracking (e.g., Sentry)
- Monitor API errors in Vercel logs

### Cost Optimization

- Monitor Anthropic API usage
- Consider caching strategies for repeated requests
- Use Vercel's Edge Functions for better performance

## Environment-Specific Configuration

### Development

```bash
# .env.local
ANTHROPIC_API_KEY=your_dev_key
```

### Production

Set in Vercel dashboard:
- `ANTHROPIC_API_KEY`: Production API key

## Troubleshooting

### Build Failures

1. Check build logs in Vercel dashboard
2. Verify Node.js version compatibility
3. Ensure all dependencies are in `package.json`

### API Errors

1. Verify `ANTHROPIC_API_KEY` is set correctly
2. Check API rate limits
3. Review Vercel function logs

### Rate Limiting Issues

1. For production, migrate to Redis-based rate limiting
2. Consider using Vercel Edge Middleware
3. Monitor rate limit headers in responses

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Custom domain set up (if applicable)
- [ ] SSL certificate active
- [ ] Analytics configured
- [ ] Error tracking set up
- [ ] Rate limiting configured for production
- [ ] Performance monitoring active
- [ ] API keys secured
- [ ] Test all features in production

## Continuous Deployment

Vercel automatically deploys on:
- Push to main branch (production)
- Push to other branches (preview)
- Pull requests (preview)

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)

## Security Best Practices

1. **Never commit API keys** - Use environment variables only
2. **Enable Vercel Authentication** - Protect admin routes if needed
3. **Use HTTPS** - Automatically enabled by Vercel
4. **Rate Limiting** - Implement proper rate limiting for production
5. **Input Validation** - Validate all user inputs
6. **Error Handling** - Don't expose sensitive error messages

## Scaling Considerations

- **API Routes**: Vercel automatically scales serverless functions
- **Database**: Consider adding a database for user data (e.g., Vercel Postgres)
- **File Storage**: Use Vercel Blob or external storage for file uploads
- **Caching**: Implement caching for frequently accessed data

