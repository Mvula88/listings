-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================
-- Additional indexes for improved query performance on common operations

-- Properties browse page - most common query
-- Sorting by premium, featured, created_at
CREATE INDEX IF NOT EXISTS idx_properties_browse
  ON properties(status, premium DESC, featured DESC, created_at DESC)
  WHERE status = 'active';

-- Properties featured listings query
CREATE INDEX IF NOT EXISTS idx_properties_featured_active
  ON properties(featured, featured_until, status)
  WHERE featured = true AND status = 'active';

-- Properties by seller
CREATE INDEX IF NOT EXISTS idx_properties_seller
  ON properties(seller_id, status, created_at DESC);

-- Inquiries - buyer lookup
CREATE INDEX IF NOT EXISTS idx_inquiries_buyer
  ON inquiries(buyer_id, created_at DESC);

-- Inquiries - property lookup with status
CREATE INDEX IF NOT EXISTS idx_inquiries_property_status
  ON inquiries(property_id, status);

-- Transactions - by status and completion
CREATE INDEX IF NOT EXISTS idx_transactions_status
  ON transactions(status, created_at DESC);

-- Payments - user lookup
CREATE INDEX IF NOT EXISTS idx_payments_user
  ON payments(user_id, created_at DESC);

-- Payments - property lookup
CREATE INDEX IF NOT EXISTS idx_payments_property
  ON payments(property_id, status);

-- Property images - ordering
CREATE INDEX IF NOT EXISTS idx_property_images_order
  ON property_images(property_id, order_index);

-- Lawyers - available lookup by location
CREATE INDEX IF NOT EXISTS idx_lawyers_available_location
  ON lawyers(available, country_id, city)
  WHERE available = true;

-- Lawyer reviews lookup
CREATE INDEX IF NOT EXISTS idx_lawyer_reviews_lawyer
  ON lawyer_reviews(lawyer_id, created_at DESC);

-- Profiles - user type lookup
CREATE INDEX IF NOT EXISTS idx_profiles_user_type
  ON profiles(user_type);

-- Conversations - participants lookup
CREATE INDEX IF NOT EXISTS idx_conversations_created
  ON conversations(created_at DESC);

-- Messages - conversation lookup
CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages(conversation_id, created_at DESC);

-- Comments
COMMENT ON INDEX idx_properties_browse IS 'Optimizes the main properties browse page query';
COMMENT ON INDEX idx_properties_featured_active IS 'Optimizes featured properties queries';
