export const CREATE_BOOKS_TABLE = `
  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    page_count INTEGER NOT NULL,
    genre TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`;

export const CREATE_READING_INSTANCES_TABLE = `
  CREATE TABLE IF NOT EXISTS reading_instances (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    ended_at INTEGER,
    status TEXT NOT NULL,
    why_started TEXT,
    current_page INTEGER DEFAULT 0,
    FOREIGN KEY (book_id) REFERENCES books(id)
  );
`;

export const CREATE_ABANDONMENT_EVENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS abandonment_events (
    id TEXT PRIMARY KEY,
    reading_instance_id TEXT NOT NULL,
    abandoned_at INTEGER NOT NULL,
    page_abandoned INTEGER NOT NULL,
    percent_complete REAL NOT NULL,
    primary_reason TEXT NOT NULL,
    emotional_state TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (reading_instance_id) REFERENCES reading_instances(id)
  );
`;

export const CREATE_COMPLETION_EVENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS completion_events (
    id TEXT PRIMARY KEY,
    reading_instance_id TEXT NOT NULL,
    completed_at INTEGER NOT NULL,
    completion_feeling TEXT NOT NULL,
    almost_quit INTEGER DEFAULT 0,
    almost_quit_page INTEGER,
    FOREIGN KEY (reading_instance_id) REFERENCES reading_instances(id)
  );
`;

export const CREATE_CHALLENGES_TABLE = `
  CREATE TABLE IF NOT EXISTS challenges (
    id TEXT PRIMARY KEY,
    reading_instance_id TEXT NOT NULL,
    challenged_at INTEGER NOT NULL,
    current_page INTEGER NOT NULL,
    doubt_reason TEXT NOT NULL,
    system_recommendation TEXT NOT NULL,
    recommendation_details TEXT,
    user_decision TEXT,
    FOREIGN KEY (reading_instance_id) REFERENCES reading_instances(id)
  );
`;
