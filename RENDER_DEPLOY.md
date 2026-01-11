# 🚀 Deploying PharmaTrack on Render

## Render Deployment Configuration

Your project is already configured for deployment on Render with the following settings:

### Configuration Files
- **`render.yaml`** - Complete Render service configuration
- **`start.sh`** - Startup script (creates tables, seeds data, starts server)
- **`requirements.txt`** - Python dependencies
- **`.gitignore`** - Excludes sensitive files

### Render Dashboard Setup

1. **Push to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "PharmaTrack - Complete Pharmacy Management System"
   git remote add origin https://github.com/YOUR_USERNAME/pharmatrack.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to [render.com](https://render.com) and sign up (free)
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub account
   - Select **"pharmatrack"** repository
   - Render will auto-detect settings from `render.yaml`

3. **Configure Environment Variables**:
   - `EMAIL_PASSWORD`: `oyrgkdssoyxhatjn` (your Gmail app password)
   - (Other variables are pre-configured in render.yaml)

4. **Deployment Details**:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `bash start.sh`
   - **Health Check**: `/docs`
   - **Plan**: Free tier (750 hours/month)

### Post-Deployment

- **App URL**: `https://pharmatrack-XXXX.onrender.com`
- **Login**: `https://your-app-url.onrender.com/static/login.html`
- **API Docs**: `https://your-app-url.onrender.com/docs`

### Admin Access
- **Email**: `sailendrabramham2003@yahoo.com`
- **Role**: Automatically assigned admin privileges

### Notes
- First load after sleep takes 5-10 seconds (auto-sleep on free tier)
- Database is SQLite (auto-created and seeded on startup)
- 33 medicines and 5 doctors are pre-seeded
- SMTP email service configured for OTP delivery

---

## 🎯 Ready for Deployment!

Your PharmaTrack system is fully configured for Render deployment. Just push to GitHub and connect to Render for automatic deployment! 🚀