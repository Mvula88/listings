-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Properties policies
CREATE POLICY "Properties are viewable by everyone" ON properties
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY "Users can insert their own properties" ON properties
  FOR INSERT WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Users can update their own properties" ON properties
  FOR UPDATE USING (seller_id = auth.uid());

CREATE POLICY "Users can delete their own properties" ON properties
  FOR DELETE USING (seller_id = auth.uid());

-- Lawyers policies
CREATE POLICY "Lawyers are viewable by everyone" ON lawyers
  FOR SELECT USING (true);

CREATE POLICY "Lawyers can update their own profile" ON lawyers
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "Users can register as lawyers" ON lawyers
  FOR INSERT WITH CHECK (profile_id = auth.uid());

-- Inquiries policies
CREATE POLICY "Users can view their own inquiries" ON inquiries
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Users can create inquiries" ON inquiries
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Users can update their own inquiries" ON inquiries
  FOR UPDATE USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Transactions policies
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

-- Payments policies
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
  FOR INSERT WITH CHECK (true); -- Will be handled by service role

-- Messages policies
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR 
    recipient_id = auth.uid()
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (recipient_id = auth.uid());