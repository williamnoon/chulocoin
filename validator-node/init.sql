-- Initialize validator database schema

CREATE TABLE IF NOT EXISTS validations (
  id SERIAL PRIMARY KEY,
  signal_id VARCHAR(255) NOT NULL,
  validator_address VARCHAR(255) NOT NULL,
  vote VARCHAR(10) NOT NULL CHECK (vote IN ('APPROVE', 'REJECT')),
  sharpe DECIMAL NOT NULL,
  win_rate DECIMAL NOT NULL CHECK (win_rate >= 0 AND win_rate <= 1),
  max_drawdown DECIMAL CHECK (max_drawdown >= 0 AND max_drawdown <= 1),
  duration_ms INTEGER,
  reward_amount DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(signal_id, validator_address)
);

CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  signal_id VARCHAR(255) NOT NULL,
  validator_address VARCHAR(255) NOT NULL,
  vote VARCHAR(10) NOT NULL CHECK (vote IN ('APPROVE', 'REJECT')),
  sharpe DECIMAL NOT NULL,
  win_rate DECIMAL NOT NULL CHECK (win_rate >= 0 AND win_rate <= 1),
  max_drawdown DECIMAL NOT NULL CHECK (max_drawdown >= 0 AND max_drawdown <= 1),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(signal_id, validator_address)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_validations_signal ON validations(signal_id);
CREATE INDEX IF NOT EXISTS idx_validations_validator ON validations(validator_address);
CREATE INDEX IF NOT EXISTS idx_validations_created ON validations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_signal ON votes(signal_id);
CREATE INDEX IF NOT EXISTS idx_votes_validator ON votes(validator_address);
CREATE INDEX IF NOT EXISTS idx_votes_created ON votes(created_at DESC);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO validator;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO validator;
