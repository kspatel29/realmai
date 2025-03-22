
// Credit conversion rate: $1 = 15 credits
export const CREDIT_CONVERSION_RATE = 15;

// Subscription plans
export const SUBSCRIPTION_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    creditsPerMonth: 75,
    description: "Try out basic features",
    features: [
      "75 credits per month",
      "Basic subtitle generation",
      "Limited dubbing",
      "Basic clip generation"
    ]
  },
  {
    id: "essentials",
    name: "Essentials",
    price: 35,
    creditsPerMonth: 550,
    description: "Perfect for beginners",
    features: [
      "550 credits per month",
      "Standard subtitle generation",
      "Multi-language dubbing",
      "Standard clip generation",
      "Email support"
    ]
  },
  {
    id: "creator-pro",
    name: "Creator Pro",
    price: 200,
    creditsPerMonth: 3100,
    description: "For serious content creators",
    features: [
      "3100 credits per month",
      "Advanced subtitle generation",
      "Premium dubbing with lip-sync",
      "High-quality clip generation",
      "Priority support"
    ]
  },
  {
    id: "studio-pro",
    name: "Studio Pro",
    price: null, // Contact sales
    creditsPerMonth: null,
    description: "Custom solutions for large teams",
    features: [
      "Custom credit allocation",
      "Dedicated account manager",
      "Custom API integration",
      "SLA guarantees",
      "White-glove onboarding"
    ]
  }
];

// Credit packages for additional purchases
export const CREDIT_PACKAGES = [
  {
    id: "small",
    name: "Small Pack",
    credits: 105,
    price: 7,
    description: "Quick boost"
  },
  {
    id: "medium",
    name: "Medium Pack",
    credits: 210,
    price: 14,
    description: "Double the value"
  },
  {
    id: "large",
    name: "Large Pack",
    credits: 525,
    price: 35,
    description: "Best value for most users"
  },
  {
    id: "xl",
    name: "XL Pack",
    credits: 1050,
    price: 70,
    description: "Power user pack"
  }
];

// Service pricing (in USD)
export const SERVICE_PRICING = {
  DUBBING: {
    BASE_PRICE_PER_MINUTE: 0.535,
    LIPSYNC_PRICE_PER_MINUTE: 1.035
  },
  SUBTITLES: {
    PRICE_PER_RUN: 0.052
  },
  VIDEO_GENERATION: {
    PRICE_PER_SECOND: 0.4
  }
};

// Service pricing (in credits)
export const SERVICE_CREDIT_COSTS = {
  DUBBING: {
    BASE_CREDITS_PER_MINUTE: Math.ceil(SERVICE_PRICING.DUBBING.BASE_PRICE_PER_MINUTE * 2 * CREDIT_CONVERSION_RATE),
    LIPSYNC_CREDITS_PER_MINUTE: Math.ceil(SERVICE_PRICING.DUBBING.LIPSYNC_PRICE_PER_MINUTE * 2 * CREDIT_CONVERSION_RATE)
  },
  SUBTITLES: {
    BASE_CREDITS: Math.ceil(SERVICE_PRICING.SUBTITLES.PRICE_PER_RUN * 2 * CREDIT_CONVERSION_RATE),
    PREMIUM_CREDITS: Math.ceil(SERVICE_PRICING.SUBTITLES.PRICE_PER_RUN * 1.5 * 2 * CREDIT_CONVERSION_RATE)
  },
  VIDEO_GENERATION: {
    CREDITS_PER_SECOND: Math.ceil(SERVICE_PRICING.VIDEO_GENERATION.PRICE_PER_SECOND * 2 * CREDIT_CONVERSION_RATE)
  }
};
