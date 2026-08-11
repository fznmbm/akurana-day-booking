// ISLAH TRUST Organization Configuration
// Eid-ul-Adha Lunch & Family Gathering 2026
// UPDATED: 27th May 2026, Wednesday


//test
export const islahtrustConfig = {
  // ============================================
  // ORGANIZATION IDENTITY
  // ============================================
  organization: {
    id: "islahtrust",
    slug: "islahtrust",
    name: "Islah Trust",
    fullName: "ISLAH TRUST Leicester",
    tagline: "Eid-Ul-Adha Lunch & Family Gathering 2026",
    logo: "/logo.png", // Using same path as AHHC for now
    website: "https://elitestack.co.uk/islahtrust-booking",
    contactEmail: "admin@islahtrust.org", // UPDATE WITH REAL EMAIL
    contactPhone: "+44 XXX XXX XXXX", // UPDATE WITH REAL PHONE
  },

  // ============================================
  // EVENT DETAILS
  // ============================================
  event: {
    name: "Eid-Ul-Adha Lunch & Family Gathering 2026",
    fullName: "Islah Trust Eid-Ul-Adha Lunch & Family Gathering 2026",

    // ✅ CONFIRMED: 27th May 2026, Wednesday
    date: "2026-05-27T13:30:00+01:00", // BST timezone
    displayDate: "27th May 2026",
    dayOfWeek: "Wednesday",
    time: "1:30 PM onwards",

    venue: "Masjid Al-Islah",
    venueAddress:
      "Northfield Neighbourhood Centre, Brighton Road, Leicester, LE5 0HA",
    capacity: 300,

    // RSVP Settings
    rsvpDeadline: "2026-05-20T22:00:00+01:00", // 1 week before
    rsvpEnabled: true,

    // Status
    status: "active",
  },

  // ============================================
  // PRICING STRUCTURE
  // ============================================
  pricing: {
    currency: "GBP",
    symbol: "£",

    tiers: [
      {
        id: "under5",
        label: "Under 5",
        price: 0,
        ageMin: 0,
        ageMax: 4,
        description: "Free entry for children under 5",
        formField: "under5",
      },
      {
        id: "child",
        label: "Age 5-12",
        price: 10,
        ageMin: 5,
        ageMax: 12,
        description: "£10 per child aged 5-12",
        formField: "age5to12",
      },
      {
        id: "adult",
        label: "Age 12+",
        price: 13, // ← Different from AHHC (£13 vs £15)
        ageMin: 12,
        ageMax: 999,
        description: "£13 per person aged 12 and above",
        formField: "age12plus",
      },
    ],
  },

  // ============================================
  // PAYMENT INFORMATION - PLACEHOLDER
  // ============================================
  payment: {
    // ⚠️ UPDATE THESE WITH REAL DETAILS LATER
    bankName: "Barclays Bank",
    accountName: "ISLAH TRUST",
    sortCode: "20-49-17",
    accountNumber: "03601358",
    reference: "Your Name",

    instructions: ["After payment, send receipt to Br. Mubarak: 07411 132976"],

    showBankDetails: true,
  },

  // ============================================
  // FEATURES TOGGLE
  // ============================================
  features: {
    // Core Features
    enableRSVP: true,
    enableCheckIn: true,
    enableQRCodes: true,

    // Meal Management System - DISABLED FOR ISLAH TRUST
    enableMealManagement: true, // ← NO MEALS

    // Additional Features
    enableWhatsAppShare: true,
    enableCSVExport: true,
    enablePublicDisplay: true,
    enableVolunteerScanner: true,

    // Branding
    showPoweredBy: true,
  },

  // ============================================
  // MEAL MANAGEMENT - DISABLED
  // ============================================
  meals: {
    // This entire section is ignored when enableMealManagement = false
    deadline: "2026-08-12T13:30:00+01:00",
    deadlineDisplay: "12th August 2026",
    options: [],
    allowDietaryRequirements: false,
    dietaryRequirementsLabel: "",
    confirmationMessage: "",
  },

  // ============================================
  // THEME / BRANDING (Islamic Green Theme)
  // ============================================
  theme: {
    // Primary Colors
    primaryColor: "#059669", // Islamic Green
    secondaryColor: "#0d9488", // Teal
    accentColor: "#f59e0b", // Gold/Amber

    // Background Colors
    darkBg: "#111827",
    lightBg: "#1f2937",
    cardBg: "#1f2937",

    // Text Colors
    textPrimary: "#f9fafb",
    textSecondary: "#9ca3af",

    // Gradients
    gradientStart: "#059669",
    gradientEnd: "#0d9488",
  },

  // ============================================
  // DATABASE CONFIGURATION
  // ============================================
  database: {
    name: "islahtrust_events",
    collections: {
      rsvps: "rsvps",
      settings: "settings",
      meals: "meals", // Not used, but schema remains
      users: "users",
    },
  },

  // ============================================
  // BRANDING & FOOTER
  // ============================================
  branding: {
    poweredByText: "Developed by EliteStack.co.uk",
    poweredByLink: "https://elitestack.co.uk",
    showInFooter: true,

    footerText: "© 2026 Islah Trust. All rights reserved.",
  },

  // ============================================
  // EMAIL / NOTIFICATIONS (Future)
  // ============================================
  notifications: {
    sendConfirmationEmail: false,
    sendReminderEmail: false,
    sendQRCodeEmail: false,
  },

  // ============================================
  // ADMIN SETTINGS
  // ============================================
  admin: {
    defaultPassword: "admin123", // Change in production
    sessionTimeout: 3600000, // 1 hour
  },
};
