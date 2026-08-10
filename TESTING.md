# 🧪 Testing & Maintenance Guide

## Pre-Launch Testing Checklist

### ✅ Public RSVP Form Testing

1. **Form Validation**
   - [ ] Try submitting without name → should show error
   - [ ] Try submitting without phone → should show error
   - [ ] Try submitting with 0 tickets → should show error
   - [ ] Valid submission should show success message

2. **Ticket Calculations**
   - [ ] Select 2 Under 5 → Total should be £0
   - [ ] Select 2 Age 5-12 → Total should be £20
   - [ ] Select 2 Age 12+ → Total should be £30
   - [ ] Mix: 1 Under 5, 2 Age 5-12, 1 Age 12+ → Total should be £35

3. **Mobile Responsiveness**
   - [ ] Test on phone (portrait mode)
   - [ ] Test on phone (landscape mode)
   - [ ] Test on tablet
   - [ ] All text readable, buttons clickable

4. **User Experience**
   - [ ] Event details clearly visible
   - [ ] Payment information easy to find
   - [ ] Success message clear
   - [ ] Form resets after submission

### ✅ Admin Dashboard Testing

1. **Login Security**
   - [ ] Wrong password → should show error
   - [ ] Correct password → should login
   - [ ] Without token, visiting /admin → redirects to login
   - [ ] After logout → can't access dashboard

2. **Dashboard Features**
   - [ ] Statistics show correct numbers
   - [ ] All RSVPs visible in table
   - [ ] Search by name works
   - [ ] Search by phone works
   - [ ] Clear search returns all results

3. **RSVP Management**
   - [ ] Change payment status → updates immediately
   - [ ] Delete RSVP → prompts confirmation
   - [ ] Delete RSVP → removes from list
   - [ ] Statistics update after delete

4. **Export Functionality**
   - [ ] Export CSV → downloads file
   - [ ] CSV contains all data
   - [ ] CSV opens correctly in Excel/Sheets

### ✅ Database Testing

1. **Data Persistence**
   - [ ] Submit RSVP → appears in admin dashboard
   - [ ] Refresh page → data still there
   - [ ] Close browser, reopen → data still there

2. **Data Integrity**
   - [ ] Phone numbers stored correctly
   - [ ] Email addresses stored correctly (optional)
   - [ ] Ticket counts accurate
   - [ ] Total amount calculated correctly
   - [ ] Timestamps show correct date/time

## Common Issues & Solutions

### Issue: "Failed to connect to MongoDB"

**Symptoms:**
- Error 500 when submitting RSVP
- Admin dashboard won't load data
- Console shows connection error

**Solutions:**
1. Check MongoDB Atlas:
   - Cluster is active (not paused)
   - Network Access allows 0.0.0.0/0
   - Database user exists with correct password

2. Check Environment Variables:
   - MONGODB_URI is set in Vercel
   - Connection string format is correct
   - Password is URL encoded if contains special chars

3. Test Connection:
   ```bash
   # In Vercel logs
   Look for: "Connected to MongoDB" or connection errors
   ```

### Issue: "Admin Login Not Working"

**Symptoms:**
- Correct password shows "Invalid password"
- Can't access admin dashboard

**Solutions:**
1. Regenerate password hash:
   ```bash
   node generate-password.js
   ```

2. Update in Vercel:
   - Go to Project Settings
   - Environment Variables
   - Edit ADMIN_PASSWORD_HASH
   - Paste new hash
   - Redeploy

3. Clear browser cache:
   - Press Ctrl+Shift+R (Windows)
   - Press Cmd+Shift+R (Mac)

### Issue: "Changes Not Appearing"

**Symptoms:**
- Updated code but site looks the same
- Environment variable changed but no effect

**Solutions:**
1. Force Vercel redeploy:
   - Go to Vercel dashboard
   - Click "Redeploy"
   - Or: `vercel --prod` in terminal

2. Clear browser cache completely
3. Try incognito/private window
4. Check Vercel deployment status

### Issue: "CSV Export Not Working"

**Symptoms:**
- Export button doesn't download
- CSV file is empty
- CSV has wrong format

**Solutions:**
1. Check browser popup blocker
2. Try different browser
3. Ensure RSVPs exist in database
4. Check browser console for errors

## Regular Maintenance Tasks

### Daily (During RSVP Period)

- [ ] Check for new RSVPs
- [ ] Update payment statuses
- [ ] Respond to any issues reported

### Weekly

- [ ] Backup data (export CSV)
- [ ] Check statistics for planning
- [ ] Verify MongoDB is running
- [ ] Check Vercel usage (should be well within free tier)

### Before Event

- [ ] Final CSV export for records
- [ ] Print attendee list
- [ ] Verify total food count
- [ ] Share final numbers with organizers

### After Event

- [ ] Keep data for 30 days minimum
- [ ] Consider downloading final backup
- [ ] Can delete old RSVPs if needed

## Security Best Practices

### ✅ DO:
- Keep admin password strong (12+ chars, mixed case, numbers, symbols)
- Change admin password after event
- Limit who has admin access
- Regularly backup data via CSV export
- Monitor for unusual activity

### ❌ DON'T:
- Share admin password publicly
- Commit .env.local to git
- Use simple passwords like "admin123"
- Keep MongoDB publicly accessible after event
- Share Vercel deployment keys

## Performance Monitoring

### What to Monitor:

1. **Response Times**
   - RSVP submission: < 2 seconds
   - Admin dashboard load: < 3 seconds
   - Search results: < 1 second

2. **Database Usage**
   - Free tier: 512MB limit
   - Check in MongoDB Atlas dashboard
   - Each RSVP ≈ 1KB = 500,000 RSVPs possible

3. **Vercel Usage**
   - Free tier: 100GB bandwidth/month
   - Check in Vercel dashboard
   - More than enough for this use case

## Emergency Contacts

If something breaks:

1. **Check Vercel Logs**
   - Project → Deployments → Latest → View Logs

2. **Check MongoDB Logs**
   - Atlas Dashboard → Cluster → Metrics

3. **Restore from Backup**
   - Use last CSV export
   - Manually re-enter if needed

## Post-Event Cleanup (Optional)

After the event (30+ days):

1. **Archive Data**
   - Export final CSV
   - Save locally
   - Share with organization

2. **Pause Services** (to save resources)
   - Pause MongoDB cluster (can resume anytime)
   - Archive Vercel project (keeps code, stops hosting)

3. **Reuse Next Year**
   - Update dates in code
   - Redeploy
   - Ready to go!

## Questions?

For technical support:
- Check Vercel documentation: https://vercel.com/docs
- Check MongoDB Atlas docs: https://docs.atlas.mongodb.com/
- Check Next.js docs: https://nextjs.org/docs

---

**Remember:** This system is robust and designed to handle way more than expected load. Don't worry! 🚀
