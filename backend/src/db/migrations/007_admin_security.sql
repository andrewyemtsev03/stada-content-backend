create table if not exists admin_sessions (
  token_hash text primary key,
  csrf_token text not null,
  login text not null,
  country_ids text[] not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  client_ip_hash text,
  user_agent text,
  constraint admin_sessions_token_hash_check check (length(token_hash) = 64),
  constraint admin_sessions_country_ids_check check (cardinality(country_ids) > 0)
);

create index if not exists idx_admin_sessions_active_expiry
  on admin_sessions(expires_at)
  where revoked_at is null;

create table if not exists admin_login_attempts (
  attempt_key text primary key,
  failed_count integer not null default 0,
  first_attempt_at timestamptz not null default now(),
  blocked_until timestamptz,
  updated_at timestamptz not null default now(),
  constraint admin_login_attempts_key_check check (length(attempt_key) = 64),
  constraint admin_login_attempts_count_check check (failed_count >= 0)
);

create index if not exists idx_admin_login_attempts_updated
  on admin_login_attempts(updated_at);
