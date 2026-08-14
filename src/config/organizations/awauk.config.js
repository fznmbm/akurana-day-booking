// AWA-UK Organization Configuration
// Akurana Welfare Association - Leicester
// Akurana Day 2026 - 26th September

export const awaukConfig = {
  // ============================================
  // ORGANIZATION IDENTITY
  // ============================================
  organization: {
    id: "awauk",
    slug: "awauk",
    name: "AWA-UK",
    fullName: "Akurana Welfare Association UK",
    tagline: "Akurana Day 2026",
    logo: "/logos/awauk-logo.png",
    website: "https://akuranaday.co.uk",
    contactEmail: "admin@awauk.org",
    contactPhone: "+44 7700 654321",
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
    capacity: 300,
    
    // RSVP Settings
    rsvpDeadline: "2026-09-15T22:00:00.000Z",
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
    bankName: "Barclays Bank",
    accountName: "AKURANA WELFARE ASSOCIATION UK",
    sortCode: "23-05-80",
    accountNumber: "45351769",
    reference: "Your Name",
    
    instructions: [
      "After payment, send receipt to Br. Imran on 07412522461",
    ],
    
    showBankDetails: true,
  },

  // ============================================
  // FEATURES TOGGLE
  // ============================================
  features: {
    enableRSVP: true,
    enableCheckIn: true,
    enableQRCodes: true,
    enableMealManagement: true,
    enableWhatsAppShare: true,
    enableCSVExport: true,
    enablePublicDisplay: true,
    enableVolunteerScanner: true,
    showPoweredBy: true,
  },

  // ============================================
  // MEAL MANAGEMENT
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
    primaryColor: "#f59e0b",
    secondaryColor: "#d97706",
    accentColor: "#10b981",
    darkBg: "#111827",
    lightBg: "#1f2937",
    cardBg: "#1f2937",
    textPrimary: "#f9fafb",
    textSecondary: "#9ca3af",
    gradientStart: "#f59e0b",
    gradientEnd: "#d97706",
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
    footerText: "© 2026 Akurana Day. All rights reserved.",
  },

  // ============================================
  // EMAIL / NOTIFICATIONS
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
    defaultPassword: "admin123",
    sessionTimeout: 3600000,
  },
};