-- Fix RLS Policies - Run this in Supabase SQL Editor
-- Run each section one at a time if needed

-- STEP 1: Drop all existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

DROP POLICY IF EXISTS "Properties are viewable by everyone" ON properties;
DROP POLICY IF EXISTS "Anyone can view active properties" ON properties;
DROP POLICY IF EXISTS "Users can insert their own properties" ON properties;
DROP POLICY IF EXISTS "Users can update their own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete their own properties" ON properties;

DROP POLICY IF EXISTS "Lawyers are viewable by everyone" ON lawyers;
DROP POLICY IF EXISTS "Anyone can view verified lawyers" ON lawyers;
DROP POLICY IF EXISTS "Lawyers can update their own profile" ON lawyers;
DROP POLICY IF EXISTS "Users can register as lawyers" ON lawyers;
DROP POLICY IF EXISTS "Lawyers can insert own profile" ON lawyers;

DROP POLICY IF EXISTS "Users can view their own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users can view own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users can create inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users can update their own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users can update own inquiries" ON inquiries;

DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create transactions from their inquiries" ON transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;

DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "System can insert payments" ON payments;
DROP POLICY IF EXISTS "Users can create own payments" ON payments;

DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can update message read status" ON messages;

-- STEP 2: Create profiles policies (MOST IMPORTANT FOR REGISTRATION)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- STEP 3: Create properties policies
CREATE POLICY "Properties are viewable by everyone" ON properties
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY "Users can insert their own properties" ON properties
  FOR INSERT WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Users can update their own properties" ON properties
  FOR UPDATE USING (seller_id = auth.uid());

CREATE POLICY "Users can delete their own properties" ON properties
  FOR DELETE USING (seller_id = auth.uid());

-- STEP 4: Create lawyers policies
CREATE POLICY "Lawyers are viewable by everyone" ON lawyers
  FOR SELECT USING (true);

CREATE POLICY "Lawyers can update their own profile" ON lawyers
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "Users can register as lawyers" ON lawyers
  FOR INSERT WITH CHECK (profile_id = auth.uid());

-- STEP 5: Create inquiries policies
CREATE POLICY "Users can view their own inquiries" ON inquiries
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Users can create inquiries" ON inquiries
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Users can update their own inquiries" ON inquiries
  FOR UPDATE USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- STEP 6: Create transactions policies
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (
    buyer_id = auth.uid() OR 
    seller_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM lawyers 
      WHERE lawyers.id IN (lawyer_buyer_id, lawyer_seller_id) 
      AND lawyers.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transactions from their inquiries" ON transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM inquiries 
      WHERE inquiries.id = inquiry_id 
      AND (inquiries.buyer_id = auth.uid() OR inquiries.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (
    buyer_id = auth.uid() OR 
    seller_id = auth.uid()
  );

-- STEP 7: Create payments policies
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM lawyers 
      WHERE lawyers.id = lawyer_id 
      AND lawyers.profile_id = auth.uid()
    )
  );

CREATE POLICY "System can insert payments" ON payments
  FOR INSERT WITH CHECK (true);

-- STEP 8: Create messages policies
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR 
    recipient_id = auth.uid()
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (recipient_id = auth.uid());

-- STEP 9: Verify the policies are created
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;