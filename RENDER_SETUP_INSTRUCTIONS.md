# Render Deployment Setup Instructions

## Environment Variables Setup

After deploying your app on Render, you need to manually set the following environment variables in your Render dashboard:

### Required Environment Variables:

1. **ADMIN_EMAIL** = `sailendrabramham2003@yahoo.com`
   - This is crucial for admin access

2. **EMAIL_PASSWORD** = `oyrgkdssoyxhatjn`
   - Your Gmail app password for sending OTP emails

### Optional (but recommended):
3. **SECRET_KEY** = (generate a strong random key)
   - For JWT token security (Render will auto-generate if not set)

4. **EMAIL_FROM** = `voldemortvoledemort@gmail.com`
   - Your Gmail address for sending emails (already in render.yaml)

## How to Set Environment Variables on Render:

1. Go to your Render dashboard
2. Select your `pharmatrack` service
3. Click on **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add the variables listed above
6. Click **"Save"** 
7. Click **"Manual Deploy"** → **"Redeploy"** to apply changes

## Important Notes:

- The `ADMIN_EMAIL` variable is critical for admin access to work
- Make sure `EMAIL_PASSWORD` is your **Gmail App Password**, not your regular Gmail password
- After setting environment variables, redeploy your service for changes to take effect
- The app will show a fallback email if ADMIN_EMAIL is not set, but admin access won't work properly

## Verification:

After redeployment, check your logs to see:
```
[CONFIG] Admin email loaded: sailendrabramham2003@yahoo.com
```

This confirms the admin email is properly configured.