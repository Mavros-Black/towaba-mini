# Vercel Deployment Guide for Towaba App

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Project**: Ensure your Supabase project is set up
3. **Payment Gateway Accounts**: Paystack and Nalo Solutions accounts configured

## Environment Variables Setup

### Required Environment Variables in Vercel

Go to your Vercel project dashboard → Settings → Environment Variables and add:

#### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SUPABASE_DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### Payment Gateway Keys
```
PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
NALO_API_KEY=your_nalo_api_key
NALO_SECRET=your_nalo_secret_key
```

#### App Configuration
```
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=https://your-app.vercel.app
```

## Deployment Steps

### 1. Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository containing your Towaba app

### 2. Configure Build Settings
- **Framework Preset**: Next.js
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (automatically detected)
- **Output Directory**: `.next` (automatically detected)
- **Install Command**: `npm install` (automatically detected)

### 3. Environment Variables
1. Add all environment variables listed above
2. Make sure to set them for Production, Preview, and Development environments
3. Use the production URLs for `NEXT_PUBLIC_BASE_URL` and `NEXTAUTH_URL`

### 4. Database Setup
1. Ensure your Supabase database is properly configured
2. Run database migrations if needed:
   ```bash
   npx prisma migrate deploy
   ```
3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

### 5. Deploy
1. Click "Deploy" in Vercel dashboard
2. Wait for the build to complete
3. Your app will be available at `https://your-app.vercel.app`

## Post-Deployment Checklist

### ✅ Verify Environment Variables
- [ ] All environment variables are set correctly
- [ ] Supabase connection is working
- [ ] Payment gateways are configured

### ✅ Test Core Functionality
- [ ] User registration and authentication
- [ ] Campaign creation and management
- [ ] Voting system
- [ ] Payment processing
- [ ] File uploads (if applicable)

### ✅ Database Verification
- [ ] Database connection is stable
- [ ] All tables are created
- [ ] Sample data can be inserted/retrieved

### ✅ Performance Check
- [ ] Page load times are acceptable
- [ ] API routes respond correctly
- [ ] Images load properly

## Troubleshooting

### Common Issues

#### Build Failures
- Check that all dependencies are in `package.json`
- Ensure Prisma client is generated during build
- Verify environment variables are set

#### Database Connection Issues
- Verify Supabase credentials
- Check database URL format
- Ensure database is accessible from Vercel

#### Payment Gateway Issues
- Verify API keys are correct
- Check webhook URLs are updated
- Test payment flows in production

#### Environment Variable Issues
- Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
- Check for typos in variable names
- Verify values are properly escaped

### Getting Help
- Check Vercel deployment logs
- Review Supabase logs
- Test API endpoints individually
- Use browser developer tools for client-side issues

## Security Considerations

1. **Environment Variables**: Never commit sensitive keys to version control
2. **API Keys**: Use different keys for development and production
3. **Database Access**: Use connection pooling and proper authentication
4. **CORS**: Configure CORS settings for your domain
5. **Rate Limiting**: Implement rate limiting for API endpoints

## Monitoring

1. **Vercel Analytics**: Enable for performance monitoring
2. **Error Tracking**: Consider adding Sentry or similar service
3. **Database Monitoring**: Monitor Supabase usage and performance
4. **Payment Monitoring**: Track payment success/failure rates

## Updates and Maintenance

1. **Regular Updates**: Keep dependencies updated
2. **Database Migrations**: Test migrations in staging first
3. **Environment Sync**: Keep environment variables in sync
4. **Backup Strategy**: Regular database backups
5. **Monitoring**: Set up alerts for critical issues
