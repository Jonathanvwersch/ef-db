CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ef_website_url VARCHAR(255) NOT NULL,
    description TEXT,
    logo VARCHAR(255),
    demo_video VARCHAR(255),
    website_url VARCHAR(255),
    revenue BIGINT,
    funding_raised BIGINT,
    latest_funding_round VARCHAR(255),
    employee_count INT,
    founding_year INT,
    industry_tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_still_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE founders (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    linkedin_url VARCHAR(255) UNIQUE,
    age INT,
    estimated_age INT,
    nationality VARCHAR(255),
    education_details JSONB,
    work_history JSONB,
    company_id INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

ALTER TABLE companies
    ADD COLUMN status VARCHAR(255) DEFAULT 'inactive';

ALTER TABLE companies 
    ADD CONSTRAINT companies_ef_website_url_key UNIQUE (ef_website_url);

-- Add new columns for simplified education and work history
ALTER TABLE founders 
    DROP COLUMN IF EXISTS education_details,
    DROP COLUMN IF EXISTS work_history,
    DROP COLUMN IF EXISTS nationality,
    DROP COLUMN IF EXISTS age,
    DROP COLUMN IF EXISTS estimated_age,
    ADD COLUMN employers TEXT[],
    ADD COLUMN education TEXT[],
    ADD COLUMN estimated_birth_year INT;

