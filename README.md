# AHHC Family Get-Together RSVP System

A simple and elegant RSVP management system for the Akurana Helping Hands Crawley Family Get-Together event.

## Features

✅ **Public RSVP Form**
- Easy ticket selection (Under 5, 5-12, 12+)
- Automatic total calculation
- Payment details display
- Mobile responsive design

✅ **Admin Dashboard**
- View all RSVPs
- Real-time statistics (total people, tickets by category, total amount)
- Search functionality
- Update payment status
- Delete RSVPs
- Export to CSV
- Secure password authentication

## Tech Stack

- **Frontend:** Next.js 14 (React)
- **Database:** MongoDB Atlas
- **Hosting:** Vercel (Free Tier)
- **Styling:** Pure CSS (no external dependencies)

## Quick Setup Guide

### 1. MongoDB Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free account/login
3. Create a new cluster (M0 Free tier)
4. Create a database user:
   - Go to Database Access
   - Add new user with password
   - Save username and password
5. Allow network access:
   - Go to Network Access
   - Add IP Address: 0.0.0.0/0 (allow all)
6. Get connection string:
   - Go to Database → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password

### 2. Generate Admin Password

Run this command to generate a password hash:

```bash
node generate-password.js
```

Enter your desired admin password when prompted. Copy the hash that's generated.

### 3. Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Update with your values:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ahhc-rsvp?retryWrites=true&w=majority
ADMIN_PASSWORD_HASH=<paste your generated hash here>
```

### 4. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables through Vercel dashboard or CLI
vercel env add MONGODB_URI
vercel env add ADMIN_PASSWORD_HASH

# Deploy to production
vercel --prod
```

#### Option B: Using Vercel Website

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub/GitLab repository
3. Or upload the project folder directly
4. Add environment variables in project settings:
   - `MONGODB_URI`
   - `ADMIN_PASSWORD_HASH`
5. Deploy!

### 5. Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Usage

### For Attendees

1. Go to your deployed URL (e.g., https://ahhc-rsvp.vercel.app)
2. Fill in the RSVP form
3. Select number of tickets
4. View total amount
5. Submit RSVP
6. Make payment using provided bank details
7. Send receipt to Br Irshan

### For Admins

1. Go to https://your-url.vercel.app/admin/login
2. Enter admin password
3. View dashboard with:
   - Total statistics
   - List of all RSVPs
   - Search functionality
   - Payment status updates
   - Export to CSV

## Admin Features

- **View Statistics:** Total RSVPs, people count, tickets by category, total amount
- **Search:** Find RSVPs by name or phone number
- **Update Status:** Mark payments as pending/paid/confirmed
- **Delete:** Remove incorrect RSVPs
- **Export:** Download all data as CSV for Excel/Sheets

## Event Details

- **Date:** Saturday, 17th January 2026
- **Time:** 1:00 PM - 8:00 PM
- **Venue:** St Wilfred School, Crawley
- **Payment Deadline:** 9th January 2026, 10:00 PM

## Ticket Pricing

- Under 5: FREE
- Age 5-12: £10
- Age 12+: £15

## Payment Details

- **Bank:** HSBC
- **Account Name:** Akurana Helping Hands Crawley UK
- **Account No:** 92155494
- **Sort Code:** 40-18-22
- **Reference:** Your name

## Security

- Admin authentication using bcrypt password hashing
- Environment variables for sensitive data
- Server-side API route protection
- No exposed credentials in frontend

## Support

For technical issues or questions:
- Check the Vercel deployment logs
- Verify MongoDB connection
- Ensure environment variables are set correctly

## Project Structure

```
ahhc-rsvp/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── rsvp/route.js          # RSVP submission
│   │   │   └── admin/
│   │   │       ├── login/route.js     # Admin auth
│   │   │       └── rsvps/route.js     # RSVP management
│   │   ├── admin/
│   │   │   ├── page.js                # Admin dashboard
│   │   │   └── login/page.js          # Admin login
│   │   ├── page.js                    # Public RSVP form
│   │   └── layout.js                  # Root layout
│   ├── lib/
│   │   └── mongodb.js                 # DB connection
│   └── models/
│       └── Rsvp.js                    # RSVP model
├── .env.local                         # Environment variables
├── package.json
└── next.config.js
```

## License

Created for Akurana Helping Hands Crawley (AHHC-UK)

---

**Built with ❤️ for the AHHC Community**
