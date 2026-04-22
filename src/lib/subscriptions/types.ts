export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'quarterly';
export type SubscriptionStatus = 'active' | 'cancelled';

export type SubscriptionRow = {
  id: string;
  user_id: string;
  name: string;
  price_cents: number;
  currency: string;
  billing_cycle: BillingCycle;
  next_renewal_date: string; // YYYY-MM-DD
  category: string;
  notes: string | null;
  website_url: string | null;
  status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
};

