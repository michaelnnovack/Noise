# Deployment Guide - Noise Detector

## Quick Deploy to Vercel

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `noise-detector` project

2. **Set Environment Variables**
   Add these in Vercel Project Settings → Environment Variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   NEXT_PUBLIC_ADSENSE_ID=your_adsense_id_here
   ```

   **⚠️ SECURITY NOTE:** Never commit actual API keys to your repository. Get these values from your Supabase project dashboard:
   - Go to Settings → API in your Supabase project
   - Copy the URL and anon key from there
   - The service role key should only be used on the server side

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

## Database Setup (Supabase)

1. **Run Database Schema**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Run the script

2. **Configure Authentication**
   - Go to Authentication → Settings
   - Enable Email authentication
   - Configure email templates if needed

## Features Working Out of the Box

✅ **Real-time noise measurement**
✅ **Guest mode** (works without database)
✅ **Responsive design**
✅ **Error handling**
✅ **Browser compatibility checks**

## Features Requiring Database

🔐 **User authentication**
📊 **Measurement history**
⚙️ **Custom threshold settings**
📈 **Data visualization charts**
📤 **CSV data export**

## Monitoring & Analytics

The app includes:
- Error boundaries for production stability
- Browser compatibility detection
- Loading states and fallbacks
- SEO optimization (robots.txt, sitemap)
- PWA manifest

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Ensure Supabase URL and keys are valid

### App Works But No Authentication
- Verify Supabase environment variables
- Check Supabase project is active
- Run the database schema

### Microphone Not Working
- Ensure site is served over HTTPS
- Check browser permissions
- Verify Web Audio API support

## Performance

Current build size:
- Main bundle: ~74KB
- First load JS: ~233KB
- Static generation: 8 pages
- Load time: <2 seconds

## Security

✅ HTTPS required for microphone access
✅ Row-level security in database
✅ Environment variables secured
✅ No audio data transmitted
✅ Privacy-first design

---

Your Noise Detector is now production-ready! 🎉