-- Initial D1 (SQLite) schema for movie database
-- Converted from PostgreSQL to SQLite compatibility

-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- API keys table
CREATE TABLE api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    api_key TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1,
    daily_limit INTEGER DEFAULT 1000,
    monthly_limit INTEGER DEFAULT 10000,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Movies table (main data)
CREATE TABLE movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    runtime INTEGER NOT NULL CHECK (runtime > 0),
    rating REAL CHECK (rating >= 0 AND rating <= 10),
    poster_url TEXT,
    director TEXT,
    plot TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(title, year)
);

-- Movie genres table (many-to-many)
CREATE TABLE movie_genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    genre TEXT NOT NULL,
    UNIQUE(movie_id, genre),
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- Movie cast table (many-to-many)
CREATE TABLE movie_cast (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    actor_name TEXT NOT NULL,
    role TEXT,
    UNIQUE(movie_id, actor_name, role),
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- Usage logs table
CREATE TABLE usage_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id INTEGER NOT NULL,
    endpoint TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_code INTEGER NOT NULL,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
);

-- Daily usage table
CREATE TABLE daily_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    request_count INTEGER DEFAULT 0,
    UNIQUE(api_key_id, date),
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
);

-- Rate limits table (for KV store backup)
CREATE TABLE rate_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id INTEGER NOT NULL,
    time_window TEXT NOT NULL,
    request_count INTEGER DEFAULT 0,
    reset_time DATETIME NOT NULL,
    UNIQUE(api_key_id, time_window),
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_movies_year ON movies(year);
CREATE INDEX idx_movies_title ON movies(title);
CREATE INDEX idx_movie_genres_movie_id ON movie_genres(movie_id);
CREATE INDEX idx_movie_genres_genre ON movie_genres(genre);
CREATE INDEX idx_movie_cast_movie_id ON movie_cast(movie_id);
CREATE INDEX idx_usage_logs_api_key_id ON usage_logs(api_key_id);
CREATE INDEX idx_usage_logs_timestamp ON usage_logs(timestamp);
CREATE INDEX idx_daily_usage_api_key_date ON daily_usage(api_key_id, date);