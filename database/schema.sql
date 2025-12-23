-- ============================================
-- HEXIFIC DATABASE SCHEMA
-- Supabase / PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. REQUEST_LOGS TABLE
-- Tracks all API requests for rate limiting
-- ============================================

CREATE TABLE IF NOT EXISTS request_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address VARCHAR(45) NOT NULL,  -- IPv4 or IPv6
    service_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional metadata (optional)
    user_agent TEXT,
    request_path VARCHAR(255),
    response_status INTEGER
);

-- Index for efficient rate limit queries
CREATE INDEX idx_request_logs_ip_service_time 
ON request_logs (ip_address, service_type, created_at DESC);

-- Index for analytics
CREATE INDEX idx_request_logs_created_at 
ON request_logs (created_at DESC);

-- ============================================
-- 2. PAYMENTS TABLE
-- Tracks premium subscriptions
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(42) NOT NULL,  -- Ethereum address (lowercase)
    plan VARCHAR(50) NOT NULL DEFAULT 'pro',
    amount_wei VARCHAR(78),  -- Wei amount as string (handles large numbers)
    tx_hash VARCHAR(66),     -- Transaction hash
    chain_id INTEGER DEFAULT 1,  -- 1 = Ethereum mainnet
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'active',  -- active, expired, cancelled
    
    CONSTRAINT valid_wallet CHECK (wallet_address ~ '^0x[a-f0-9]{40}$')
);

-- Index for payment lookups
CREATE INDEX idx_payments_wallet 
ON payments (wallet_address, expires_at DESC);

-- Index for active payments
CREATE INDEX idx_payments_active 
ON payments (status, expires_at) 
WHERE status = 'active';

-- ============================================
-- 3. AUDIT_HISTORY TABLE (Optional)
-- Stores audit results for premium users
-- ============================================

CREATE TABLE IF NOT EXISTS audit_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(42),
    contract_address VARCHAR(42),
    network VARCHAR(50) DEFAULT 'mainnet',
    contract_name VARCHAR(255),
    audit_type VARCHAR(50) NOT NULL,  -- slither, ai, comprehensive
    
    -- Results summary
    total_issues INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    
    -- Full results (stored as JSON)
    results JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user audit history
CREATE INDEX idx_audit_history_wallet 
ON audit_history (wallet_address, created_at DESC);

-- Index for contract lookups
CREATE INDEX idx_audit_history_contract 
ON audit_history (contract_address, network);

-- ============================================
-- 4. HELPER FUNCTIONS
-- ============================================

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_ip_address VARCHAR,
    p_service_type VARCHAR,
    p_limit INTEGER DEFAULT 3,
    p_window_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    allowed BOOLEAN,
    remaining INTEGER,
    used INTEGER
) AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM request_logs
    WHERE ip_address = p_ip_address
      AND service_type = p_service_type
      AND created_at > NOW() - (p_window_hours || ' hours')::INTERVAL;
    
    RETURN QUERY SELECT 
        v_count < p_limit AS allowed,
        GREATEST(0, p_limit - v_count) AS remaining,
        v_count AS used;
END;
$$ LANGUAGE plpgsql;

-- Function to clean old logs (run periodically)
CREATE OR REPLACE FUNCTION clean_old_logs(p_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM request_logs
    WHERE created_at < NOW() - (p_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. ROW LEVEL SECURITY (Optional)
-- Enable if using Supabase Auth
-- ============================================

-- ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_history ENABLE ROW LEVEL SECURITY;

-- Example policies (uncomment if using RLS)
-- CREATE POLICY "Users can view own audits" ON audit_history
--     FOR SELECT USING (wallet_address = current_setting('request.jwt.claims')::json->>'wallet_address');

-- ============================================
-- 6. SAMPLE DATA (for testing)
-- ============================================

-- Insert sample rate limit logs
-- INSERT INTO request_logs (ip_address, service_type) VALUES 
--     ('192.168.1.1', 'audit'),
--     ('192.168.1.1', 'audit'),
--     ('192.168.1.2', 'ai-assist');

-- Insert sample payment
-- INSERT INTO payments (wallet_address, plan, expires_at) VALUES 
--     ('0x1234567890123456789012345678901234567890', 'pro', NOW() + INTERVAL '30 days');

-- ============================================
-- 7. VIEWS FOR ANALYTICS
-- ============================================

-- Daily usage stats
CREATE OR REPLACE VIEW daily_usage_stats AS
SELECT 
    DATE(created_at) AS date,
    service_type,
    COUNT(*) AS requests,
    COUNT(DISTINCT ip_address) AS unique_users
FROM request_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), service_type
ORDER BY date DESC, requests DESC;

-- Service type breakdown
CREATE OR REPLACE VIEW service_stats AS
SELECT 
    service_type,
    COUNT(*) AS total_requests,
    COUNT(DISTINCT ip_address) AS unique_users,
    MIN(created_at) AS first_request,
    MAX(created_at) AS last_request
FROM request_logs
GROUP BY service_type
ORDER BY total_requests DESC;

COMMENT ON TABLE request_logs IS 'Tracks API requests for rate limiting';
COMMENT ON TABLE payments IS 'Premium subscription payments';
COMMENT ON TABLE audit_history IS 'Stored audit results for premium users';
