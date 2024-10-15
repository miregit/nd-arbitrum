CREATE TABLE IF NOT EXISTS blockchain_event (
  id SERIAL,
  tx_type VARCHAR NOT NULL,
  tx_hash VARCHAR NOT NULL,
  opportunity_address VARCHAR NOT NULL,
  investor VARCHAR NOT NULL,
  amount VARCHAR NOT NULL,
  token_id VARCHAR NOT NULL,
  txTimestamp TIMESTAMP
);