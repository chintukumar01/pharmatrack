# 🚀 PharmaTrack Deployment Guide

## Quick Deploy Options

### Option 1: Render (Recommended - Easiest)

**Step 1: Prepare GitHub Repository**

```bash
cd /Users/ch.shiva/projects/pharmacy-system

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - PharmaTrack Pharmacy System"

# Create GitHub repo and push
# Go to github.com → New Repository → pharmatrack
git remote add origin https://github.com/YOUR_USERNAME/pharmatrack.git
git branch -M main
git push -u origin main
```

**Step 2: Deploy on Render**

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select `pharmatrack` repository
5. Render will auto-detect `render.yaml` and configure everything!
6. Add environment variable:
   - **EMAIL_PASSWORD**: `oyrgkdssoyxhatjn` (your Gmail app password)
7. Click **"Create Web Service"**

**Done!** Your app will be live at: `https://pharmatrack.onrender.com`

---

### Option 2: Railway (Alternative)

**Step 1: Push to GitHub** (same as above)

**Step 2: Deploy on Railway**

1. Go to [railway.app](https://railway.app) and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `pharmatrack` repository
4. Add environment variables in Settings:
   ```
   ADMIN_EMAIL=sailendrabramham2003@yahoo.com
   EMAIL_FROM=voldemortvoledemort@gmail.com
   EMAIL_PASSWORD=oyrgkdssoyxhatjn
   SECRET_KEY=your-secret-key-change-this
   DATABASE_URL=sqlite:///./pharmacy.db
   ```
5. Add start command in Settings → Deploy:
   ```
   bash start.sh
   ```
6. Click **"Deploy"**

**Done!** Your app will be live at: `https://pharmatrack.up.railway.app`

---

### Option 3: Vercel (For Static Sites)

⚠️ **Note:** Vercel is better for frontend-only apps. For full-stack with database, use Render or Railway.

---

## 📝 Post-Deployment Checklist

### ✅ Test Your Deployed App

1. **Access Login Page:**
   ```
   https://your-app-url.onrender.com/static/login.html
   ```

2. **Test Admin Login:**
   - Email: `sailendrabramham2003@yahoo.com`
   - Send OTP → Check Yahoo inbox
   - Verify and login → Should redirect to admin dashboard

3. **Test User Login:**
   - Email: `any-other-email@example.com`
   - Send OTP → Check that email
   - Verify → Should redirect to user dashboard

4. **Test API Docs:**
   ```
   https://your-app-url.onrender.com/docs
   ```

### ✅ Update Frontend URLs

The JavaScript files already use `window.location.origin`, so they'll automatically work with the deployed URL! No changes needed.

### ✅ Configure Custom Domain (Optional)

**On Render:**
1. Go to your service → Settings
2. Add custom domain
3. Update DNS records as instructed

**On Railway:**
1. Go to Settings → Domains
2. Add custom domain
3. Configure DNS

---

## 🔧 Environment Variables Explained

| Variable | Value | Description |
|----------|-------|-------------|
| `ADMIN_EMAIL` | `sailendrabramham2003@yahoo.com` | Admin user email |
| `EMAIL_FROM` | `voldemortvoledemort@gmail.com` | Gmail account for sending OTPs |
| `EMAIL_PASSWORD` | `oyrgkdssoyxhatjn` | Gmail app password (NOT regular password) |
| `SECRET_KEY` | Auto-generated or custom | JWT token secret key |
| `DATABASE_URL` | `sqlite:///./pharmacy.db` | SQLite database path |

---

## 🐛 Troubleshooting

### Issue: OTP emails not received

**Solution:**
- Verify `EMAIL_PASSWORD` is the App Password (not Gmail password)
- Check Gmail "Less secure app access" settings
- Check spam folder

### Issue: Database not initialized

**Solution:**
- Check deployment logs
- Ensure `start.sh` has execute permissions
- Manually run: `python create_table.py && python seed_data.py`

### Issue: Static files not loading

**Solution:**
- Ensure `/static/` path is correct
- Check CSS/JS file paths have `?v=X.X` cache busting

### Issue: App crashes on startup

**Solution:**
- Check logs on Render/Railway dashboard
- Verify all dependencies in `requirements.txt`
- Check Python version (3.11 recommended)

---

## 📊 Free Tier Limits

### Render Free Tier:
- ✅ 750 hours/month (enough for one app 24/7)
- ✅ Auto-sleep after 15 min inactivity
- ✅ Wakes up on request (slight delay)
- ✅ 512 MB RAM
- ❌ Limited to SQLite (no PostgreSQL on free)

### Railway Free Tier:
- ✅ $5 credit/month
- ✅ ~500 hours runtime
- ✅ No auto-sleep
- ✅ 512 MB RAM

---

## 🎯 Production Recommendations

For production use, consider:

1. **Upgrade to PostgreSQL** (instead of SQLite)
2. **Enable HTTPS** (auto-enabled on Render/Railway)
3. **Add rate limiting** for API endpoints
4. **Set up monitoring** (UptimeRobot, etc.)
5. **Configure backup** for database
6. **Add logging** (Sentry, LogRocket)

---

## 🔗 Useful Links

- **Render Docs:** https://render.com/docs
- **Railway Docs:** https://docs.railway.app
- **FastAPI Deployment:** https://fastapi.tiangolo.com/deployment/

---

## ✨ Your App is Live!

Once deployed, share your app:

📱 **Login:** `https://your-app-url.onrender.com/static/login.html`  
📚 **API Docs:** `https://your-app-url.onrender.com/docs`  
👨‍💼 **Admin:** `sailendrabramham2003@yahoo.com`  
👤 **User:** Any other email

**Congratulations! 🎉** Your PharmaTrack system is now accessible worldwide!
