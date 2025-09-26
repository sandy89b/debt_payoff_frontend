export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year' | 'one-time';
  description: string;
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
  buttonText: string;
  buttonVariant: 'default' | 'outline' | 'secondary';
}

export interface DigitalProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'workbook' | 'course' | 'plan';
  features: string[];
}

export interface ServicePayment {
  id: string;
  name: string;
  price: number;
  description: string;
  duration: string;
  features: string[];
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  paymentMethod?: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    interval: 'month',
    description: 'Debt calculator + basic framework',
    features: [
      'Access to debt calculator',
      'Basic financial framework',
      'Standard support',
      'Basic templates'
    ],
    buttonText: 'Your current plan',
    buttonVariant: 'outline',
    isCurrent: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    interval: 'month',
    description: 'Full email automation + advanced analytics',
    features: [
      'Everything in Basic',
      'Full email automation',
      'Advanced analytics',
      'Priority support',
      'Advanced templates',
      'Email campaigns'
    ],
    isPopular: true,
    buttonText: 'Get Premium',
    buttonVariant: 'default'
  },
  {
    id: 'coaching',
    name: 'Coaching',
    price: 29.99,
    interval: 'month',
    description: '1-on-1 coaching sessions + priority support',
    features: [
      'Everything in Premium',
      '1-on-1 coaching sessions',
      'Priority support',
      'Personalized guidance',
      'Custom strategies',
      'Monthly check-ins'
    ],
    buttonText: 'Get Coaching',
    buttonVariant: 'default'
  }
];

export const DIGITAL_PRODUCTS: DigitalProduct[] = [
  {
    id: 'workbook',
    name: 'Advanced Debt Elimination Workbook',
    price: 19.99,
    description: 'Comprehensive guide to debt elimination',
    category: 'workbook',
    features: [
      'Step-by-step debt elimination guide',
      'Budgeting templates',
      'Progress tracking sheets',
      'Financial goal worksheets'
    ]
  },
  {
    id: 'course',
    name: 'Biblical Financial Planning Course',
    price: 49.99,
    description: 'Complete course on biblical financial principles',
    category: 'course',
    features: [
      '8-week video course',
      'Biblical financial principles',
      'Practical applications',
      'Certificate of completion'
    ]
  },
  {
    id: 'plan',
    name: 'Personalized Debt Freedom Plan',
    price: 99.99,
    description: 'Custom debt freedom strategy tailored to your situation',
    category: 'plan',
    features: [
      'Personalized debt strategy',
      'Custom timeline',
      'Detailed action plan',
      'Follow-up support'
    ]
  }
];

export const SERVICE_PAYMENTS: ServicePayment[] = [
  {
    id: 'consultation',
    name: '30-minute Debt Strategy Consultation',
    price: 75,
    description: 'One-on-one consultation to discuss your debt strategy',
    duration: '30 minutes',
    features: [
      'Personalized debt analysis',
      'Custom strategy development',
      'Action plan creation',
      'Follow-up resources'
    ]
  },
  {
    id: 'makeover',
    name: 'Complete Financial Makeover Session',
    price: 200,
    description: 'Comprehensive financial review and strategy session',
    duration: '2 hours',
    features: [
      'Complete financial analysis',
      'Debt elimination strategy',
      'Budget optimization',
      'Investment recommendations',
      'Written action plan'
    ]
  },
  {
    id: 'coaching-program',
    name: '3-month Coaching Program',
    price: 500,
    description: 'Intensive 3-month coaching program for debt freedom',
    duration: '3 months',
    features: [
      'Weekly coaching sessions',
      'Personalized strategies',
      'Progress monitoring',
      '24/7 support access',
      'Custom resources',
      'Accountability partner'
    ]
  }
];
