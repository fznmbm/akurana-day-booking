# 🚀 Quick Deployment Guide

## Complete Setup in 15 Minutes

### Step 1: MongoDB Setup (5 minutes)

1. **Create MongoDB Atlas Account**
   - Go to: https://cloud.mongodb.com/
   - Sign up with Google/Email
   - Choose FREE tier (M0)

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "M0 Free" option
   - Select region closest to UK (Ireland recommended)
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access" (left menu)
   - Click "Add New Database User"
   - Username: `ahhc-admin`
   - Password: Click "Autogenerate Secure Password" and SAVE IT
   - Database User Privileges: "Atlas Admin"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" (left menu)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" (left menu)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://ahhc-admin:<password>@...`
   - Replace `<password>` with the password you saved earlier

### Step 2: Generate Admin Password (2 minutes)

1. **Install Dependencies**
   ```bash
   cd ahhc-rsvp
   npm install
   ```

2. **Generate Password Hash**
   ```bash
   node generate-password.js
   ```
   
3. **Choose a Strong Password**
   - Example: `AHHC2026@Secure!`
   - Copy the generated hash

### Step 3: Deploy to Vercel (5 minutes)

#### Option A: Deploy via Vercel Website (Easiest)

1. **Prepare Files**
   - Zip your `ahhc-rsvp` folder
   - Or create a GitHub repository

2. **Deploy on Vercel**
   - Go to: https://vercel.com
   - Sign up with GitHub/GitLab/Email
   - Click "Add New Project"
   - Upload your project or import from GitHub
   - Framework Preset: Should auto-detect as "Next.js"

3. **Add Environment Variables**
   - Before deploying, click "Environment Variables"
   - Add two variables:
   
   **Variable 1:**
   - Name: `MONGODB_URI`
   - Value: `mongodb+srv://ahhc-admin:YOUR_PASSWORD@cluster.mongodb.net/ahhc-rsvp?retryWrites=true&w=majority`
   - Replace `YOUR_PASSWORD` with your MongoDB password
   
   **Variable 2:**
   - Name: `ADMIN_PASSWORD_HASH`
   - Value: (paste the hash from generate-password.js)

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site is live! 🎉

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# When prompted, answer:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? ahhc-rsvp
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add MONGODB_URI production
# Paste your MongoDB connection string

vercel env add ADMIN_PASSWORD_HASH production
# Paste your password hash

# Deploy to production
vercel --prod
```

### Step 4: Test Your Application (3 minutes)

1. **Test Public RSVP**
   - Visit: `https://your-app.vercel.app`
   - Fill in test RSVP
   - Submit and verify success message

2. **Test Admin Dashboard**
   - Visit: `https://your-app.vercel.app/admin/login`
   - Enter your admin password
   - Verify you can see the test RSVP
   - Try changing payment status
   - Try exporting to CSV

3. **Share the Link**
   - Copy your Vercel URL
   - Share with AHHC members
   - Post in the group

### Troubleshooting

**Can't connect to MongoDB?**
- Check connection string format
- Ensure password doesn't have special characters (or URL encode them)
- Verify Network Access allows 0.0.0.0/0

**Admin login not working?**
- Regenerate password hash with generate-password.js
- Update ADMIN_PASSWORD_HASH in Vercel
- Redeploy: `vercel --prod`

**Changes not showing?**
- Vercel automatically deploys on git push
- Or run: `vercel --prod` to manually deploy
- Clear browser cache: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

**Database not saving?**
- Check Vercel deployment logs
- Verify MongoDB connection string
- Check MongoDB Atlas cluster is active (not paused)

### Common Questions

**Q: Is this really free?**
A: Yes! MongoDB Atlas M0 and Vercel Hobby tier are completely free forever.

**Q: How many RSVPs can it handle?**
A: Free MongoDB tier allows 512MB storage = thousands of RSVPs easily.

**Q: Can I change the admin password later?**
A: Yes, run generate-password.js again, update ADMIN_PASSWORD_HASH in Vercel, redeploy.

**Q: What if I need help?**
A: Check the logs in Vercel dashboard or MongoDB Atlas monitoring.

### Your URLs

After deployment, save these URLs:

- **Public RSVP Form:** `https://your-app.vercel.app`
- **Admin Login:** `https://your-app.vercel.app/admin/login`
- **Admin Dashboard:** `https://your-app.vercel.app/admin`

### Sharing with Members

**Message Template:**
```
السلام عليكم AHHC Family! 🎉

Please submit your RSVP for our Family Get-Together:
🔗 https://your-app.vercel.app

Remember:
✅ Fill in all details
✅ Make payment by 9th Jan 2026
✅ Send receipt to Br Irshan (07892804448)

See you all on January 17th! 🥳
```

---

**Done! Your RSVP system is live! 🚀**
