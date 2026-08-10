# 🎉 AHHC RSVP System - START HERE!

## 📦 What You Have

A complete, production-ready RSVP management system for your event!

## 🚀 Quick Start (15 Minutes)

### Step 1: Read This First
Open and read these files IN ORDER:

1. **PROJECT-SUMMARY.md** ← Read this first! (Overview of everything)
2. **DEPLOYMENT.md** ← Follow this to deploy (Step-by-step)
3. **TESTING.md** ← Test before going live
4. **QUICK-REFERENCE.md** ← Keep this handy for daily use

### Step 2: Set Up (5 minutes)

1. **Extract the folder**
   - Unzip if needed
   - Keep all files together

2. **Install Node.js** (if not already installed)
   - Download from: https://nodejs.org/
   - Choose LTS version
   - Install with default settings

3. **Open Terminal/Command Prompt**
   - Windows: Press `Win + R`, type `cmd`, press Enter
   - Mac: Press `Cmd + Space`, type `terminal`, press Enter

4. **Navigate to project**
   ```bash
   cd path/to/ahhc-rsvp
   ```

5. **Install dependencies**
   ```bash
   npm install
   ```

### Step 3: Configure (5 minutes)

1. **Set up MongoDB**
   - Follow instructions in DEPLOYMENT.md
   - Get your connection string
   - Save it somewhere safe

2. **Generate admin password**
   ```bash
   node generate-password.js
   ```
   - Choose a strong password
   - Copy the hash it generates

3. **Create environment file**
   - Copy `.env.local.example` to `.env.local`
   - Add your MongoDB connection string
   - Add your password hash

### Step 4: Test Locally (3 minutes)

1. **Run development server**
   ```bash
   npm run dev
   ```

2. **Open browser**
   - Go to: http://localhost:3000
   - Test the RSVP form
   - Go to: http://localhost:3000/admin/login
   - Test admin dashboard

3. **If everything works, you're ready to deploy!**

### Step 5: Deploy to Vercel (5 minutes)

Follow the detailed instructions in **DEPLOYMENT.md**

Quick version:
1. Go to https://vercel.com
2. Sign up (free)
3. Import your project
4. Add environment variables
5. Deploy!

## 📁 Important Files

```
ahhc-rsvp/
├── PROJECT-SUMMARY.md      ← Overview & features
├── DEPLOYMENT.md           ← Step-by-step deployment
├── TESTING.md              ← Testing & troubleshooting
├── QUICK-REFERENCE.md      ← Daily use reference
├── README.md               ← Technical documentation
├── generate-password.js    ← Password generator tool
├── .env.local.example      ← Environment template
├── package.json            ← Dependencies
└── src/                    ← Application code
```

## 🎯 Your Workflow

1. **NOW:** Deploy the system
2. **TODAY:** Test thoroughly
3. **THIS WEEK:** Share with members
4. **ONGOING:** Monitor RSVPs
5. **BEFORE EVENT:** Export final list

## 💡 Need Help?

### Quick Answers:

**Q: Do I need coding experience?**
A: No! Just follow the step-by-step guides.

**Q: Is it really free?**
A: Yes! MongoDB and Vercel are free forever.

**Q: How long does deployment take?**
A: About 15 minutes total.

**Q: What if something breaks?**
A: Check TESTING.md for troubleshooting.

**Q: Can I customize it?**
A: Yes, but deploy as-is first, then customize.

### Still Stuck?

1. Re-read DEPLOYMENT.md carefully
2. Check Vercel deployment logs
3. Verify MongoDB connection
4. Try in a different browser
5. Check that all environment variables are set

## 🎊 What This System Does

### For Members:
- Submit RSVP online
- See ticket prices
- View payment details
- Get confirmation

### For Admins:
- View all RSVPs
- Track payments
- Export to CSV
- Manage attendees
- See statistics

## 🔐 Security Note

**Keep these PRIVATE:**
- Admin password
- MongoDB connection string
- Vercel deployment settings
- .env.local file

**Can share publicly:**
- Public RSVP form URL
- Event details
- Payment information

## ✅ Success Checklist

Before sharing with members:

- [ ] System deployed to Vercel
- [ ] MongoDB connected
- [ ] Admin login works
- [ ] Test RSVP submission works
- [ ] Data appears in admin dashboard
- [ ] CSV export works
- [ ] Mobile view looks good
- [ ] All guides read

## 🎉 Ready to Launch?

Once deployed:

1. **Test everything** (5 minutes)
2. **Share the URL** with members
3. **Monitor daily** during RSVP period
4. **Export CSV** regularly for backup
5. **Update payment statuses** as received

## 📞 Contact Information

Share this with members:

```
📅 Event: 17 January 2026, 1pm-8pm
📍 Venue: St Wilfred School, Crawley
🎟️ RSVP: [Your Vercel URL]
💷 Payment: Br Irshan (07892804448)
⏰ Deadline: 9 January 2026, 10pm
```

## 🚀 Next Steps

1. ✅ Read PROJECT-SUMMARY.md
2. ✅ Follow DEPLOYMENT.md
3. ✅ Test using TESTING.md
4. ✅ Keep QUICK-REFERENCE.md handy
5. ✅ Share with community!

---

**You've got this! Everything you need is here. Just follow the guides! 💪**

**Start with DEPLOYMENT.md now! →**
