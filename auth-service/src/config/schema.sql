CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY  DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
 
CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);    -- creates index so that email search queries can be done faster

CREATE TABLE verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    token_hash VARCHAR(256) NOT NULL,
    type VARCHAR(32) NOT NULL,  --eg PASSWORD_RESET, EMAIL_VERIFY, CONTACT_NUMBER_VERIFY
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() 
);

CREATE INDEX idx_tokens_hash ON verification_tokens(token_hash);   -- creates index on token_hash so search queries can be done faster

