-- Verify that sample listings were created successfully

-- Check total properties by country
SELECT 
  c.name as country,
  COUNT(p.id) as total_properties,
  COUNT(CASE WHEN p.featured = true THEN 1 END) as featured_properties,
  COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_properties,
  MIN(p.price) as min_price,
  MAX(p.price) as max_price,
  AVG(p.price)::NUMERIC(10,0) as avg_price
FROM properties p
JOIN countries c ON p.country_id = c.id
GROUP BY c.name
ORDER BY c.name;

-- Check property types distribution
SELECT 
  property_type,
  COUNT(*) as count
FROM properties
WHERE status = 'active'
GROUP BY property_type
ORDER BY count DESC;

-- Check featured properties with details
SELECT 
  p.title,
  p.city,
  p.property_type,
  p.price,
  c.currency_symbol,
  p.featured,
  p.status,
  COUNT(pi.id) as image_count
FROM properties p
JOIN countries c ON p.country_id = c.id
LEFT JOIN property_images pi ON pi.property_id = p.id
WHERE p.featured = true
GROUP BY p.id, p.title, p.city, p.property_type, p.price, c.currency_symbol, p.featured, p.status
ORDER BY p.created_at DESC;

-- Check if images were added
SELECT 
  COUNT(DISTINCT property_id) as properties_with_images,
  COUNT(*) as total_images
FROM property_images;

-- Show sample of active listings
SELECT 
  p.title,
  p.city || ', ' || p.province as location,
  p.property_type,
  c.currency_symbol || TO_CHAR(p.price, 'FM999,999,999') as formatted_price,
  p.bedrooms || ' bed, ' || p.bathrooms || ' bath, ' || p.square_meters || 'm²' as specs
FROM properties p
JOIN countries c ON p.country_id = c.id
WHERE p.status = 'active'
LIMIT 10;