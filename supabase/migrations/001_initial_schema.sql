-- Countries/Regions
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(2) UNIQUE NOT NULL, -- 'NA', 'ZA'
  name VARCHAR(100) NOT NULL,
  currency VARCHAR(3) NOT NULL, -- 'NAD', 'ZAR'
  currency_symbol VARCHAR(5) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (Auth extended)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  country_id UUID REFERENCES countries(id),
  user_type VARCHAR(20), -- 'buyer', 'seller', 'lawyer', 'admin'
  avatar_url TEXT,
  stripe_customer_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lawyers/Conveyancers
CREATE TABLE lawyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  firm_name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100),
  country_id UUID REFERENCES countries(id),
  city VARCHAR(100),
  specializations TEXT[],
  years_experience INTEGER,
  transactions_completed INTEGER DEFAULT 0,
  flat_fee_buyer DECIMAL(10,2), -- Fee for representing buyer
  flat_fee_seller DECIMAL(10,2), -- Fee for representing seller
  rating DECIMAL(3,2) DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  available BOOLEAN DEFAULT TRUE,
  bio TEXT,
  languages TEXT[],
  -- Stripe payment fields
  stripe_account_id VARCHAR(255) UNIQUE,
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  payment_method VARCHAR(20) DEFAULT 'invoice', -- 'stripe_connect' or 'invoice'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id),
  country_id UUID REFERENCES countries(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type VARCHAR(50), -- 'house', 'apartment', 'land', etc
  price DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3),
  bedrooms INTEGER,
  bathrooms INTEGER,
  square_meters INTEGER,
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'pending', 'sold'
  listing_type VARCHAR(20) DEFAULT 'basic', -- 'basic', 'premium'
  featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Images
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text VARCHAR(255),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Inquiries
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  message TEXT,
  status VARCHAR(20) DEFAULT 'new', -- 'new', 'responded', 'viewing_scheduled', 'proceeded_to_transaction'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations (between buyers and sellers)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID REFERENCES inquiries(id),
  property_id UUID REFERENCES properties(id),
  participants UUID[], -- Array of user IDs
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'archived', 'transaction_started'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions (Main transaction record)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID REFERENCES inquiries(id),
  property_id UUID REFERENCES properties(id),
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  lawyer_buyer_id UUID REFERENCES lawyers(id),
  lawyer_seller_id UUID REFERENCES lawyers(id),
  agreed_price DECIMAL(12,2),
  status VARCHAR(30) DEFAULT 'initiated', -- 'initiated', 'lawyers_selected', 'in_progress', 'pending_payment', 'completed'
  -- Payment tracking
  buyer_success_fee_paid BOOLEAN DEFAULT FALSE,
  seller_success_fee_paid BOOLEAN DEFAULT FALSE,
  buyer_lawyer_fee_paid BOOLEAN DEFAULT FALSE,
  seller_lawyer_fee_paid BOOLEAN DEFAULT FALSE,
  -- Dates
  lawyers_selected_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lawyer Matches (Tracks lawyer selection process)
CREATE TABLE lawyer_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id),
  user_id UUID REFERENCES profiles(id),
  lawyer_id UUID REFERENCES lawyers(id),
  user_type VARCHAR(10), -- 'buyer' or 'seller'
  status VARCHAR(20) DEFAULT 'proposed', -- 'proposed', 'selected', 'accepted', 'rejected'
  selected_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Records
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id),
  user_id UUID REFERENCES profiles(id),
  lawyer_id UUID REFERENCES lawyers(id),
  type VARCHAR(30), -- 'success_fee_buyer', 'success_fee_seller', 'lawyer_referral', 'premium_listing'
  amount DECIMAL(10,2),
  currency VARCHAR(3),
  status VARCHAR(20), -- 'pending', 'processing', 'succeeded', 'failed', 'refunded'
  -- Stripe references
  stripe_payment_intent_id VARCHAR(255),
  stripe_checkout_session_id VARCHAR(255),
  stripe_invoice_id VARCHAR(255),
  payment_method VARCHAR(20), -- 'card', 'eft', 'invoice'
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lawyer Billing (Monthly aggregation)
CREATE TABLE lawyer_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID REFERENCES lawyers(id),
  billing_period_start DATE,
  billing_period_end DATE,
  total_referrals INTEGER,
  total_amount DECIMAL(10,2),
  currency VARCHAR(3),
  stripe_invoice_id VARCHAR(255),
  status VARCHAR(20), -- 'pending', 'sent', 'paid', 'overdue'
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES profiles(id),
  recipient_id UUID REFERENCES profiles(id),
  transaction_id UUID REFERENCES transactions(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID REFERENCES lawyers(id),
  user_id UUID REFERENCES profiles(id),
  transaction_id UUID REFERENCES transactions(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Properties
CREATE TABLE saved_properties (
  user_id UUID REFERENCES profiles(id),
  property_id UUID REFERENCES properties(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, property_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_properties_country ON properties(country_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_lawyers_country ON lawyers(country_id);
CREATE INDEX idx_lawyers_city ON lawyers(city);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Insert initial countries
INSERT INTO countries (code, name, currency, currency_symbol) VALUES
  ('NA', 'Namibia', 'NAD', 'N$'),
  ('ZA', 'South Africa', 'ZAR', 'R');