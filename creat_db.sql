SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'amica_db' AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS amica_db;
DROP ROLE IF EXISTS amica_user;

CREATE ROLE amica_user WITH LOGIN PASSWORD 'YOUR_SECURE_PASSWORD';

CREATE DATABASE amica_db OWNER amica_user;