-- =============================================
-- Supabase Database Schema for Collaborative Whiteboard
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- =============================================
-- ROOMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_type VARCHAR(20) DEFAULT 'public' CHECK (access_type IN ('public', 'private', 'protected')),
    password_hash VARCHAR(255),
    max_users INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    document BYTEA,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for rooms table
CREATE INDEX IF NOT EXISTS idx_rooms_owner ON rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_rooms_access ON rooms(access_type);
CREATE INDEX IF NOT EXISTS idx_rooms_short_code ON rooms(short_code);
CREATE INDEX IF NOT EXISTS idx_rooms_active ON rooms(is_active);

-- =============================================
-- ROOM USERS (Junction Table)
-- =============================================
CREATE TABLE IF NOT EXISTS room_users (
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission_level VARCHAR(20) DEFAULT 'collaborator' CHECK (permission_level IN ('viewer', 'collaborator', 'moderator', 'owner')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (room_id, user_id)
);

-- Create indexes for room_users table
CREATE INDEX IF NOT EXISTS idx_room_users_room ON room_users(room_id);
CREATE INDEX IF NOT EXISTS idx_room_users_user ON room_users(user_id);

-- =============================================
-- OPERATIONS TABLE (Drawing Data)
-- =============================================
CREATE TABLE IF NOT EXISTS operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('draw', 'erase', 'shape', 'text', 'image', 'undo', 'redo')),
    operation_data JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    vector_clock JSONB
);

-- Create indexes for operations table
CREATE INDEX IF NOT EXISTS idx_operations_room_time ON operations(room_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_operations_user ON operations(user_id);
CREATE INDEX IF NOT EXISTS idx_operations_data ON operations USING gin(operation_data);

-- =============================================
-- FUNCTION: Generate random short code for rooms
-- =============================================
CREATE OR REPLACE FUNCTION generate_short_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
    code_exists BOOLEAN := true;
BEGIN
    -- Keep generating until we get a unique code
    WHILE code_exists LOOP
        result := '';
        -- Generate 8-character code
        FOR i IN 1..8 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        END LOOP;
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM rooms WHERE short_code = result) INTO code_exists;
    END LOOP;
    
    RETURN result;
END;
$$ language 'plpgsql';

-- =============================================
-- FUNCTION: Auto-update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- FUNCTION: Set short code on room creation
-- =============================================
CREATE OR REPLACE FUNCTION set_room_short_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.short_code IS NULL OR NEW.short_code = '' THEN
        NEW.short_code = generate_short_code();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- TRIGGERS: Auto-update updated_at
-- =============================================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at 
    BEFORE UPDATE ON rooms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_set_room_short_code ON rooms;
CREATE TRIGGER trigger_set_room_short_code
    BEFORE INSERT ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION set_room_short_code();

-- =============================================
-- ROW LEVEL SECURITY (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access (for backend)
CREATE POLICY "Service role has full access to users" ON users
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to rooms" ON rooms
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to room_users" ON room_users
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to operations" ON operations
    FOR ALL USING (true);

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================
-- Uncomment below to insert test data

-- INSERT INTO users (username, email, password, first_name, last_name) VALUES
-- ('testuser1', 'test1@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/4E8B.WlVhYQzY8fxu', 'Test', 'User1'),
-- ('testuser2', 'test2@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/4E8B.WlVhYQzY8fxu', 'Test', 'User2');
