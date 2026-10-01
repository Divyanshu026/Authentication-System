CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY  DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'SUPER_ADMIN')),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) NOT NULL DEFAULT 'USER';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_role_check
            CHECK (role IN ('USER', 'ADMIN', 'SUPER_ADMIN'));
    END IF;
END $$;
 
CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);    -- creates index so that email search queries can be done faster

CREATE TABLE IF NOT EXISTS verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(256) NOT NULL,
    type VARCHAR(32) NOT NULL,  --eg PASSWORD_RESET, EMAIL_VERIFY, CONTACT_NUMBER_VERIFY
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() 
);

CREATE INDEX IF NOT EXISTS idx_tokens_hash ON verification_tokens(token_hash);   -- creates index on token_hash so search queries can be done faster

