-- Inicialização do banco de dados Track Games
-- Este script é executado automaticamente quando o container PostgreSQL é criado

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Criar schema principal
CREATE SCHEMA IF NOT EXISTS track_games;

-- Definir search_path para usar o schema principal
SET search_path TO track_games, public;

-- Comentário sobre o banco
COMMENT ON DATABASE track_games IS 'Banco de dados para a plataforma Track Games - Reviews de jogos digitais';

-- Criar usuário específico para a aplicação (se necessário)
-- CREATE USER track_games_app WITH PASSWORD 'app_password';
-- GRANT ALL PRIVILEGES ON DATABASE track_games TO track_games_app;
-- GRANT ALL PRIVILEGES ON SCHEMA track_games TO track_games_app;
