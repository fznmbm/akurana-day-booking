// AHHC Organization Configuration
// Akurana Helping Hands Crawley - Family Get-Together 2026

export const ahhcConfig = {
  // ============================================
  // ORGANIZATION IDENTITY
  // ============================================
  organization: {
    id: "ahhc",
    slug: "ahhc", // Used in URLs
    name: "AHHC",
    fullName: "Akurana Helping Hands Crawley",
    tagline: "Family Get-Together 2026",
    logo: "/logos/ahhc-logo.png",
    website: "https://elitestack.co.uk/ahhc",
    contactEmail: "admin@ahhc.org",
    contactPhone: "+44 123 456 7890",
  },

  // ============================================
  // EVENT DETAILS
  // ============================================
  event: {
    name: "Family Get-Together 2026",
    fullName: "AHHC Family Get-Together 2026",
    date: "2026-01-17T13:00:00Z", // ISO format
    displayDate: "17th January 2026",
    dayOfWeek: "Friday",
    time: "1:00 PM - 8:00 PM",
    venue: "St Wilfred School, Crawley",
    venueAddress: "St Wilfred School, Crawley, West Sussex",
    capacity: 500,
    
    // RSVP Settings
    rsvpDeadline: "2026-01-09T22:00:00Z",
    rsvpEnabled: true,
    
    // Status
    status: "active", // draft, active, closed
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
        formField: "under5", // Database field name
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
        price: 15,
        ageMin: 12,
        ageMax: 999,
        description: "£15 per person aged 12 and above",
        formField: "age12plus",
      },
    ],
  },

  // ============================================
  // PAYMENT INFORMATION
  // ============================================
  payment: {
    bankName: "HSBC UK",
    accountName: "AHHC Events",
    sortCode: "40-47-84",
    accountNumber: "12345678",
    reference: "AHHC2026",
    
    instructions: [
      "Please use your NAME as the payment reference",
      "Payment must be received before the RSVP deadline",
      "You will receive a QR code after payment confirmation",
    ],
    
    // Display in RSVP form
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
    
    // Meal Management System
    enableMealManagement: true, // ← TOGGLE FOR MEALS
    
    // Additional Features
    enableWhatsAppShare: true,
    enableCSVExport: true,
    enablePublicDisplay: true,
    enableVolunteerScanner: true,
    
    // Branding
    showPoweredBy: true,
  },

  // ============================================
  // MEAL MANAGEMENT (Only if enabled)
  // ============================================
  meals: {
    deadline: "2026-01-12T22:00:00Z",
    deadlineDisplay: "12th January 2026, 10:00 PM",
    
    options: [
      {
        id: "chicken",
        name: "Chicken Curry",
        description: "Mild curry with rice and vegetables",
        available: true,
      },
      {
        id: "fish",
        name: "Fish & Chips",
        description: "Fried fish with chips and peas",
        available: true,
      },
      {
        id: "veg",
        name: "Vegetarian Curry",
        description: "Mixed vegetable curry with rice",
        available: true,
      },
    ],
    
    allowDietaryRequirements: true,
    dietaryRequirementsLabel: "Any dietary requirements or allergies?",
    
    confirmationMessage: "Thank you! Your meal selection has been saved.",
  },

  // ============================================
  // THEME / BRANDING
  // ============================================
  theme: {
    // Primary Colors
    primaryColor: "#667eea",
    secondaryColor: "#10b981",
    accentColor: "#ec4899",
    
    // Background Colors
    darkBg: "#111827",
    lightBg: "#1f2937",
    cardBg: "#1f2937",
    
    // Text Colors
    textPrimary: "#f9fafb",
    textSecondary: "#9ca3af",
    
    // Gradients
    gradientStart: "#667eea",
    gradientEnd: "#10b981",
  },

  // ============================================
  // DATABASE CONFIGURATION
  // ============================================
  database: {
    name: "ahhc_events",
    collections: {
      rsvps: "rsvps",
      settings: "settings",
      meals: "meals",
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
    
    // Custom Footer Text
    footerText: "© 2026 AHHC. All rights reserved.",
  },

  // ============================================
  // EMAIL / NOTIFICATIONS (Future)
  // ============================================
  notifications: {
    sendConfirmationEmail: false, // Future feature
    sendReminderEmail: false,
    sendQRCodeEmail: false,
  },

  // ============================================
  // ADMIN SETTINGS
  // ============================================
  admin: {
    defaultPassword: "admin123", // Change in production
    sessionTimeout: 3600000, // 1 hour in milliseconds
  },
};
