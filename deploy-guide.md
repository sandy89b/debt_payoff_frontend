# 🚀 Complete Deployment Guide

## Prerequisites
- Node.js installed
- Vercel CLI installed (`npm install -g vercel`)
- ngrok.exe in `D:\ngrok-v3-stable-windows-amd64\`
- PostgreSQL database running locally

## Step-by-Step Deployment

### 1. Deploy Frontend to Vercel

#### 1.1 Login to Vercel
```bash
vercel login
```

#### 1.2 Deploy Frontend
```bash
vercel
```
- Follow prompts to set up project
- Choose your account scope
- Project name: `debt-freedom-builder-bible`
- Directory: `./` (current directory)

#### 1.3 Get Vercel URL
- After deployment, Vercel will give you a URL like: `https://debt-freedom-builder-bible.vercel.app`
- **Save this URL** - you'll need it for backend configuration

### 2. Set up Backend with ngrok

#### 2.1 Start Backend Server
```bash
cd backend
npm start
```
- Server should run on `http://localhost:3001`

#### 2.2 Start ngrok Tunnel
```bash
# Option 1: Use the batch file
start-ngrok.bat

# Option 2: Manual command
cd "D:\ngrok-v3-stable-windows-amd64"
ngrok http 3001
```

#### 2.3 Copy ngrok URL
- ngrok will show: `https://abc123.ngrok.io`
- **Copy this HTTPS URL**

### 3. Configure Environment Variables

#### 3.1 Update Vercel Environment Variables
1. Go to: https://vercel.com/dashboard
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-ngrok-url.ngrok.io`
   - **Environment:** All (Production, Preview, Development)

#### 3.2 Update Backend Configuration
Edit `backend/config.env`:
```env
# Add your Vercel URL
VERCEL_URL=https://your-project-name.vercel.app
```

#### 3.3 Restart Backend
```bash
cd backend
npm start
```

### 4. Redeploy Frontend
```bash
vercel --prod
```

## Testing Your Deployment

### 1. Test Frontend
- Visit your Vercel URL: `https://your-project.vercel.app`
- Try to sign up/sign in

### 2. Test Backend Connection
- Check if frontend can connect to backend
- Look for network requests in browser dev tools

### 3. Common Issues & Solutions

#### Issue: CORS Error
**Solution:** Make sure your Vercel URL is added to `backend/config.env`:
```env
VERCEL_URL=https://your-project-name.vercel.app
```

#### Issue: ngrok URL Changes
**Solution:** ngrok free tier gives you a new URL each time. You need to:
1. Update Vercel environment variable with new ngrok URL
2. Redeploy frontend: `vercel --prod`

#### Issue: Database Connection
**Solution:** Make sure PostgreSQL is running locally and accessible

## Production Considerations

### For Production Deployment:
1. **Use ngrok Pro** for static URLs
2. **Deploy backend to a cloud service** (Railway, Render, Heroku)
3. **Use a cloud database** (Supabase, PlanetScale, AWS RDS)
4. **Set up proper domain** and SSL certificates

### Security Notes:
- Never commit `.env` files to git
- Use strong JWT secrets in production
- Enable HTTPS everywhere
- Set up proper CORS policies

## Quick Commands Reference

```bash
# Deploy frontend
vercel --prod

# Start backend
cd backend && npm start

# Start ngrok
cd "D:\ngrok-v3-stable-windows-amd64" && ngrok http 3001

# Check deployment status
vercel ls
```

## Support
If you encounter issues:
1. Check Vercel deployment logs
2. Check backend console for errors
3. Verify environment variables are set correctly
4. Ensure ngrok tunnel is active
