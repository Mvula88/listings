-- Migration: Update Platform Fee Pricing Tiers
-- Description: Update pricing structure for better sustainability and value alignment
-- Date: 2025-11-01

-- Drop and recreate the calculate_platform_fee function with new tiers
CREATE OR REPLACE FUNCTION calculate_platform_fee(property_price DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  RETURN CASE
    WHEN property_price <= 500000 THEN 4500
    WHEN property_price <= 1000000 THEN 7500
    WHEN property_price <= 1500000 THEN 9500
    WHEN property_price <= 2500000 THEN 12500
    WHEN property_price <= 5000000 THEN 18000
    WHEN property_price <= 10000000 THEN 30000
    ELSE 45000
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add comment documenting the pricing structure
COMMENT ON FUNCTION calculate_platform_fee IS 'Calculates tiered platform fee based on property price. Updated 2025-11-01 for improved pricing structure: R4.5K (≤500K), R7.5K (≤1M), R9.5K (≤1.5M), R12.5K (≤2.5M), R18K (≤5M), R30K (≤10M), R45K (>10M)';
