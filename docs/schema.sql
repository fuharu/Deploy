-- ---------------------------------
-- 1. Users テーブル
-- ---------------------------------
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- UUIDを主キーとし、デフォルトで自動生成
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    university VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------
-- 2. Companies テーブル
-- ---------------------------------
CREATE TABLE Companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE, -- unique制約
    url VARCHAR(255),
    address VARCHAR(255),
    industry VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- ---------------------------------
-- 3. UserCompanySelections テーブル
-- ---------------------------------
CREATE TABLE UserCompanySelections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES Companies(id), -- 外部キー
    user_id UUID NOT NULL REFERENCES Users(id),       -- 外部キー
    
    status VARCHAR(50) NOT NULL, -- interested/entry/.../rejected
    motivation_level INTEGER,    -- 1-5
    mypage_url VARCHAR(255),
    login_id VARCHAR(255),
    login_mailaddress VARCHAR(255),
    encrypted_password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    
    -- 複合ユニークインデックス
    UNIQUE (company_id, user_id)
);

-- ---------------------------------
-- 4. Events テーブル
-- ---------------------------------
CREATE TABLE Events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES Companies(id), -- 外部キー (NULL可)
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- interview/seminar/deadline/other
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    description TEXT
);

-- ---------------------------------
-- 5. UserEvents テーブル (中間テーブル)
-- ---------------------------------
CREATE TABLE UserEvents (
    event_id UUID NOT NULL REFERENCES Events(id),
    user_id UUID NOT NULL REFERENCES Users(id),
    
    status VARCHAR(50) NOT NULL, -- entry/joined/canceled
    
    -- 複合主キー
    PRIMARY KEY (event_id, user_id) 
);

-- ---------------------------------
-- 6. reflections テーブル (振り返り)
-- ---------------------------------
CREATE TABLE reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 外部キーかつユニーク制約により、Eventsテーブルと1対1の関係を構築
    event_id UUID NOT NULL UNIQUE REFERENCES Events(id), 
    
    content TEXT,
    good_points TEXT,
    bad_points TEXT,
    self_score INTEGER, -- 1-5
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------
-- 7. es_entries テーブル (ES提出)
-- ---------------------------------
CREATE TABLE es_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES Companies(id),
    user_id UUID NOT NULL REFERENCES Users(id),
    content TEXT,
    file_url VARCHAR(255),
    status VARCHAR(50), -- draft/completed
    submitted_at DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- ---------------------------------
-- 8. tasks テーブル (Todoリスト)
-- ---------------------------------
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES Users(id),
    company_id UUID REFERENCES Companies(id), -- 外部キー (NULL可)
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    is_completed BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);