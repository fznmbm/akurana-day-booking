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
    name: "Akurana Day 2026 - Grand Get Together",
    fullName: "Akurana Day 2026 - All UK Akuranaites Grand Get Together",
    date: "2026-09-26T13:00:00Z",
    displayDate: "26th September 2026",
    dayOfWeek: "Saturday",
    time: "13:00 - 20:00",
    venue: "Claremont High School",
    venueAddress: "Claremont Avenue, Harrow, HA3 0UH",
    capacity: 1500,
    rsvpDeadline: "2026-09-15T22:00:00.000Z",
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
        price: 12,
        ageMin: 5,
        ageMax: 12,
        description: "£12 per child aged 5-12",
        formField: "age5to12",
      },
      {
        id: "adult",
        label: "Age 12+",
        price: 18,
        ageMin: 12,
        ageMax: 999,
        description: "£18 per person aged 12 and above",
        formField: "age12plus",
      },
    ],
  },

  // ============================================
  // PAYMENT INFORMATION
  // ============================================
  payment: {
    bankName: "HSBC UK",
    accountName: "AKURANA HELPING HANDS CRAWLEY",
    sortCode: "40-18-22",
    accountNumber: "92155494",
    reference: "Your Name", // Attendees should use their name as reference
    
    instructions: [
      "After payment, send receipt to Br. Irshan on 07892804448",
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
deadline: "2026-09-12T22:00:00Z",
deadlineDisplay: "12th September 2026, 10:00 PM",
    
    options: [
  {
    id: "rice-curry",
    name: "Rice & Curry",
    description: "Traditional curry with rice",
    available: true,
  },
  {
    id: "burger-meal",
    name: "Burger Meal",
    description: "Burger with fries",
    available: true,
  },
  {
    id: "nuggets-chips",
    name: "Nuggets & Chips",
    description: "Chicken nuggets with chips (Under 5s)",
    available: true,
  },
  {
    id: "not-required",
    name: "Not Required",
    description: "No meal needed",
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
    name: "akuranaday",
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
    footerText: "© 2026 Akurana Day. All rights reserved.",
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
