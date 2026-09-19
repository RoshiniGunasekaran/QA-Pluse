import { Pool } from 'pg';

export const pool = new Pool({
  user: 'dev',
  password: 'devpass',
  host: 'localhost',
  port: 5432,
  database: 'qa_pulse',
});