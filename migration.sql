-- ============================================================================
-- EDENS GATES: Database Migration for Enhanced Features
-- ============================================================================
-- This migration adds:
-- 1. Enhanced RLS policies for secure admin operations
-- 2. Vote throttling and rate limiting
-- 3. File upload columns for founder media
-- 4. Supabase Storage bucket and policies
-- 5. On-chain transaction support for votes
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ON-CHAIN VOTING: Add transaction signature tracking
-- ----------------------------------------------------------------------------

-- Add tx_sig column to store Solana transaction signatures
ALTER TABLE votes 
ADD COLUMN IF NOT EXISTS tx_sig text;

-- Add index on tx_sig for fast lookups
CREATE INDEX IF NOT EXISTS votes_tx_sig_idx 
ON votes (tx_sig);

-- Add composite index on founder_id and wallet for efficient queries
CREATE INDEX IF NOT EXISTS votes_founder_wallet_idx 
ON votes (founder_id, wallet);

-- Add comment to document the tx_sig column
COMMENT ON COLUMN votes.tx_sig IS 'Solana transaction signature for on-chain votes (null for off-chain votes)';

-- ----------------------------------------------------------------------------

-- ----------------------------------------------------------------------------
-- 1. Enhanced RLS Policies for Founders Table
-- ----------------------------------------------------------------------------

-- Remove existing UPDATE policy if it exists
DROP POLICY IF EXISTS "founders_update_policy" ON founders;

-- Restrict founder UPDATE operations to service_role or specific RPC functions
-- This ensures only Edge Functions or admin operations can modify status/is_active
CREATE POLICY "founders_admin_update_policy" ON founders
FOR UPDATE USING (
  -- Allow service_role (Edge Functions)
  auth.role() = 'service_role'
  OR
  -- Allow specific admin operations (fallback for client-side admin when Edge Functions disabled)
  (
    auth.role() = 'anon' 
    AND current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
  )
);

-- Ensure SELECT remains public for reading founder data
DROP POLICY IF EXISTS "founders_select_policy" ON founders;
CREATE POLICY "founders_select_policy" ON founders
FOR SELECT USING (true);

-- Ensure INSERT remains public for new submissions
DROP POLICY IF EXISTS "founders_insert_policy" ON founders;
CREATE POLICY "founders_insert_policy" ON founders
FOR INSERT WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 2. Vote Rate Limiting and Throttling
-- ----------------------------------------------------------------------------

-- Create function to check vote throttling (1 vote per founder per IP hash)
CREATE OR REPLACE FUNCTION check_vote_throttle(
  p_founder_id uuid,
  p_ip_hash text
) RETURNS boolean AS $$
BEGIN
  -- Check if this IP has already voted for this founder
  IF EXISTS (
    SELECT 1 FROM votes 
    WHERE founder_id = p_founder_id 
    AND ip_hash = p_ip_hash
  ) THEN
    RETURN false; -- Already voted
  END IF;
  
  -- Add additional rate limiting here if needed
  -- Example: max 10 votes per IP per hour
  IF (
    SELECT COUNT(*) FROM votes 
    WHERE ip_hash = p_ip_hash 
    AND created_at > NOW() - INTERVAL '1 hour'
  ) >= 10 THEN
    RETURN false; -- Rate limit exceeded
  END IF;
  
  RETURN true; -- Vote allowed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update votes INSERT policy to include throttling
DROP POLICY IF EXISTS "votes_insert_policy" ON votes;
CREATE POLICY "votes_insert_policy" ON votes
FOR INSERT WITH CHECK (
  -- Basic vote throttling check
  check_vote_throttle(founder_id, ip_hash)
);

-- Ensure votes SELECT remains public for counting
DROP POLICY IF EXISTS "votes_select_policy" ON votes;
CREATE POLICY "votes_select_policy" ON votes
FOR SELECT USING (true);

-- ----------------------------------------------------------------------------
-- 3. Add File Upload Columns to Founders Table
-- ----------------------------------------------------------------------------

-- Add thumbnail and deck URL columns (nullable for backward compatibility)
ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS deck_url TEXT;

-- Add helpful comments
COMMENT ON COLUMN founders.thumbnail_url IS 'Public URL for project thumbnail image (JPEG/PNG/WebP)';
COMMENT ON COLUMN founders.deck_url IS 'Public URL for pitch deck PDF';

-- ----------------------------------------------------------------------------
-- 4. Supabase Storage: Create Bucket and Policies
-- ----------------------------------------------------------------------------

-- Create founder-media bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'founder-media',
  'founder-media', 
  true, -- Public bucket for easy access
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous users to upload files (with size/type restrictions enforced by bucket)
CREATE POLICY "founder_media_upload_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'founder-media'
  AND auth.role() = 'anon'
);

-- Allow public read access to all files in the bucket
CREATE POLICY "founder_media_select_policy" ON storage.objects
FOR SELECT USING (
  bucket_id = 'founder-media'
);

-- Allow users to delete their own uploads (optional - for cleanup)
CREATE POLICY "founder_media_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'founder-media'
  AND auth.role() = 'anon'
);

-- ----------------------------------------------------------------------------
-- 5. Update Existing RPC Functions (if needed)
-- ----------------------------------------------------------------------------

-- Ensure get_active_founders_with_votes RPC includes new columns
CREATE OR REPLACE FUNCTION get_active_founders_with_votes()
RETURNS TABLE (
  id UUID,
  name TEXT,
  handle TEXT,
  description TEXT,
  video_url TEXT,
  site_link TEXT,
  thumbnail_url TEXT,
  deck_url TEXT,
  created_at TIMESTAMPTZ,
  vote_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.handle,
    f.description,
    f.video_url,
    f.site_link,
    f.thumbnail_url,
    f.deck_url,
    f.created_at,
    COALESCE(v.vote_count, 0) as vote_count
  FROM founders f
  LEFT JOIN (
    SELECT 
      founder_id,
      COUNT(*) as vote_count
    FROM votes
    GROUP BY founder_id
  ) v ON f.id = v.founder_id
  WHERE f.status = 'approved' AND f.is_active = true
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 6. Grant Necessary Permissions
-- ----------------------------------------------------------------------------

-- Ensure anon role can execute the throttle check function
GRANT EXECUTE ON FUNCTION check_vote_throttle(uuid, text) TO anon;

-- Ensure anon role can execute the updated RPC
GRANT EXECUTE ON FUNCTION get_active_founders_with_votes() TO anon;

-- ----------------------------------------------------------------------------
-- 7. Create Indexes for Performance
-- ----------------------------------------------------------------------------

-- Index for vote throttling queries
CREATE INDEX IF NOT EXISTS idx_votes_ip_hash_created_at ON votes(ip_hash, created_at);

-- Index for vote counting by founder
CREATE INDEX IF NOT EXISTS idx_votes_founder_id ON votes(founder_id);

-- Index for active founders lookup
CREATE INDEX IF NOT EXISTS idx_founders_status_active ON founders(status, is_active) WHERE status = 'approved';

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Verify the migration by checking that:
-- 1. Founders table has new thumbnail_url and deck_url columns
-- 2. Storage bucket 'founder-media' exists with proper policies
-- 3. Vote throttling function works correctly
-- 4. RLS policies are properly configured for admin operations

SELECT 'Migration completed successfully!' as status;