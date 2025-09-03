-- Sample Listings Data for Supabase
-- This script creates sample property listings with images
-- Run this in Supabase SQL Editor after your initial schema is set up

-- First, ensure we have countries if they don't exist
INSERT INTO countries (code, name, currency, currency_symbol) 
VALUES 
  ('NA', 'Namibia', 'NAD', 'N$'),
  ('ZA', 'South Africa', 'ZAR', 'R')
ON CONFLICT (code) DO NOTHING;

-- Create a sample seller profile (you'll need to replace this with an actual user ID from auth.users)
-- For testing, we'll create a dummy seller profile
DO $$
DECLARE
  namibia_id UUID;
  south_africa_id UUID;
  seller_id UUID := gen_random_uuid();
BEGIN
  -- Get country IDs
  SELECT id INTO namibia_id FROM countries WHERE code = 'NA';
  SELECT id INTO south_africa_id FROM countries WHERE code = 'ZA';

  -- Insert a test seller profile (in production, this would be linked to auth.users)
  -- You can skip this if you already have user profiles
  INSERT INTO profiles (id, email, full_name, phone, country_id, user_type)
  VALUES 
    (seller_id, 'sample.seller@dealdirect.com', 'Sample Seller', '+264812345678', namibia_id, 'seller')
  ON CONFLICT (id) DO NOTHING;

  -- Insert sample properties for Namibia
  INSERT INTO properties (
    seller_id, country_id, title, description, property_type, price, currency,
    bedrooms, bathrooms, square_meters, address_line1, city, province,
    postal_code, latitude, longitude, status, featured
  ) VALUES 
    -- Namibia Properties
    (
      seller_id, namibia_id,
      'Modern Family Home in Klein Windhoek',
      'Beautiful 4-bedroom family home with modern finishes, swimming pool, and double garage. Located in a quiet cul-de-sac with 24-hour security. Perfect for families looking for comfort and security.',
      'house', 2850000, 'NAD',
      4, 3, 280, '12 Acacia Street', 'Windhoek', 'Khomas',
      '9000', -22.5609, 17.0658, 'active', true
    ),
    (
      seller_id, namibia_id,
      'Beach House with Direct Access in Swakopmund',
      'Stunning beachfront property with panoramic ocean views. Features open-plan living, modern kitchen, and entertainment area. Walking distance to the Jetty and restaurants.',
      'house', 3200000, 'NAD',
      3, 2, 190, '45 Strand Street', 'Swakopmund', 'Erongo',
      '9000', -22.6842, 14.5189, 'active', true
    ),
    (
      seller_id, namibia_id,
      'Luxury Apartment in Windhoek Central',
      'Top floor apartment with city views, 24-hour security, gym, and swimming pool facilities. Modern finishes throughout with built-in appliances.',
      'apartment', 1450000, 'NAD',
      2, 2, 95, '78 Independence Avenue', 'Windhoek', 'Khomas',
      '9000', -22.5700, 17.0836, 'active', false
    ),
    (
      seller_id, namibia_id,
      'Game Farm near Okahandja',
      '500-hectare game farm with main house, guest cottages, and staff quarters. Stocked with various game species. Ideal for eco-tourism or private retreat.',
      'farm', 8500000, 'NAD',
      5, 3, 420, 'Farm Otjihase', 'Okahandja', 'Otjozondjupa',
      '9000', -21.9894, 16.9147, 'active', true
    );

  -- Insert sample properties for South Africa
  INSERT INTO properties (
    seller_id, country_id, title, description, property_type, price, currency,
    bedrooms, bathrooms, square_meters, address_line1, city, province,
    postal_code, latitude, longitude, status, featured
  ) VALUES 
    (
      seller_id, south_africa_id,
      'Luxury Apartment with Ocean Views in Cape Town',
      'Premium 3-bedroom apartment in the V&A Waterfront with breathtaking ocean and mountain views. High-end finishes, concierge service, and secure parking.',
      'apartment', 4500000, 'ZAR',
      3, 2, 180, '10 Marina Boulevard', 'Cape Town', 'Western Cape',
      '8001', -33.9249, 18.4241, 'active', true
    ),
    (
      seller_id, south_africa_id,
      'Spacious Townhouse in Secure Estate, Centurion',
      'Modern townhouse in sought-after estate with excellent security. Features include private garden, double garage, and access to estate amenities.',
      'townhouse', 1950000, 'ZAR',
      3, 2.5, 220, '45 Eagle Canyon Drive', 'Centurion', 'Gauteng',
      '0157', -25.8603, 28.1894, 'active', false
    ),
    (
      seller_id, south_africa_id,
      'Contemporary Villa with Pool in Sandton',
      'Architect-designed villa with infinity pool, home cinema, and smart home technology. Located in exclusive Sandhurst estate with top security.',
      'villa', 6800000, 'ZAR',
      5, 4, 450, '23 Coronation Road', 'Sandton', 'Gauteng',
      '2196', -26.1076, 28.0567, 'active', true
    ),
    (
      seller_id, south_africa_id,
      'Cozy Studio in Cape Town CBD',
      'Perfect investment or first-time buyer opportunity. Modern studio with city views, 24-hour security, and rooftop pool. Walking distance to shops and restaurants.',
      'studio', 950000, 'ZAR',
      1, 1, 45, '88 Long Street', 'Cape Town', 'Western Cape',
      '8001', -33.9249, 18.4191, 'active', false
    ),
    (
      seller_id, south_africa_id,
      'Investment Property with Tenants in Rosebank',
      'Fully tenanted 2-bedroom apartment generating excellent rental income. Modern complex with backup power and water. Great location near Gautrain station.',
      'apartment', 1450000, 'ZAR',
      2, 1, 85, '56 Oxford Road', 'Rosebank', 'Gauteng',
      '2196', -26.1467, 28.0367, 'active', false
    ),
    (
      seller_id, south_africa_id,
      'Farm House with Large Plot in Stellenbosch',
      'Historic Cape Dutch farmhouse on 10 hectares with vineyard potential. Original features preserved, modern amenities added. Mountain and valley views.',
      'farm', 8500000, 'ZAR',
      6, 4, 520, 'Helshoogte Pass Road', 'Stellenbosch', 'Western Cape',
      '7600', -33.9321, 18.8602, 'active', true
    ),
    (
      seller_id, south_africa_id,
      'Modern Loft in Johannesburg CBD',
      'Converted warehouse loft with industrial chic design. High ceilings, exposed brick, and city skyline views. Trendy Maboneng precinct location.',
      'apartment', 1250000, 'ZAR',
      2, 1, 110, '264 Fox Street', 'Johannesburg', 'Gauteng',
      '2001', -26.2041, 28.0473, 'active', false
    ),
    (
      seller_id, south_africa_id,
      'Seaside Cottage in Hermanus',
      'Charming cottage with sea views, walking distance to beaches and whale watching spots. Perfect holiday home or retirement property.',
      'house', 2950000, 'ZAR',
      3, 2, 150, '12 Marine Drive', 'Hermanus', 'Western Cape',
      '7200', -34.4200, 19.2345, 'active', true
    );

END $$;

-- Add property images for all properties
-- Using Unsplash images as placeholders
INSERT INTO property_images (property_id, url, alt_text, order_index)
SELECT 
  p.id,
  CASE 
    WHEN p.property_type = 'house' THEN 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop'
    WHEN p.property_type = 'apartment' THEN 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
    WHEN p.property_type = 'townhouse' THEN 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop'
    WHEN p.property_type = 'villa' THEN 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop'
    WHEN p.property_type = 'studio' THEN 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'
    WHEN p.property_type = 'farm' THEN 'https://images.unsplash.com/photo-1524634126442-357e0eac3c14?w=800&h=600&fit=crop'
    ELSE 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
  END,
  'Primary image',
  0
FROM properties p;

-- Add additional interior images
INSERT INTO property_images (property_id, url, alt_text, order_index)
SELECT 
  p.id,
  'https://images.unsplash.com/photo-1560448076-213b0099830f?w=800&h=600&fit=crop',
  'Living room',
  1
FROM properties p;

INSERT INTO property_images (property_id, url, alt_text, order_index)
SELECT 
  p.id,
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
  'Kitchen',
  2
FROM properties p;

INSERT INTO property_images (property_id, url, alt_text, order_index)
SELECT 
  p.id,
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop',
  'Bedroom',
  3
FROM properties p;

-- Update view counts to make it look more realistic
UPDATE properties 
SET views = floor(random() * 500 + 50)
WHERE status = 'active';

-- Add some featured properties (already set in the inserts above)
-- You can adjust which properties are featured by updating the featured column

-- Output confirmation
SELECT 
  c.name as country,
  COUNT(p.id) as property_count,
  COUNT(CASE WHEN p.featured = true THEN 1 END) as featured_count,
  AVG(p.price)::NUMERIC(10,0) as avg_price
FROM properties p
JOIN countries c ON p.country_id = c.id
WHERE p.status = 'active'
GROUP BY c.name
ORDER BY c.name;