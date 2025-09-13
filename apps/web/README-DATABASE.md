# 🗄️ Configuração do Banco de Dados PostgreSQL

Este documento explica como configurar e usar o banco de dados PostgreSQL com Docker para o projeto Track Games.

## 🚀 Início Rápido

### 1. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure suas variáveis:

```bash
cp env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações específicas.

### 2. Iniciar o Banco de Dados

```bash
# Instalar dependências
npm install

# Iniciar containers Docker
npm run db:up
```

### 3. Verificar se está Funcionando

- **PostgreSQL**: `localhost:5432`
- **PgAdmin**: `http://localhost:8080`
  - Email: `admin@trackgames.com`
  - Senha: `admin123`

## 📋 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run db:up` | Inicia os containers do banco |
| `npm run db:down` | Para os containers |
| `npm run db:reset` | Reseta completamente o banco (remove dados) |
| `npm run db:logs` | Mostra logs do PostgreSQL |

## 🏗️ Estrutura do Banco

### Tabelas Principais

- **users**: Usuários da plataforma
- **games**: Catálogo de jogos
- **reviews**: Reviews dos usuários

### Schema

O banco usa o schema `track_games` para organizar as tabelas.

## 🔧 Configuração Avançada

### Conexão com Drizzle ORM

```typescript
import { db } from './src/db/connection';

// Exemplo de uso
const users = await db.select().from(usersTable);
```

### Migrações

```bash
# Gerar migração
npx drizzle-kit generate

# Aplicar migrações
npx drizzle-kit migrate
```

## 🐳 Docker Compose

O arquivo `docker-compose.yml` inclui:

- **PostgreSQL 15**: Banco principal
- **PgAdmin**: Interface web para administração
- **Volumes**: Persistência de dados
- **Networks**: Rede isolada para os serviços

## 🔒 Segurança

- Use senhas fortes em produção
- Configure SSL para conexões externas
- Mantenha as variáveis de ambiente seguras
- Use diferentes credenciais para desenvolvimento e produção

## 📊 Monitoramento

- Acesse PgAdmin para monitorar o banco
- Use `npm run db:logs` para ver logs em tempo real
- Configure alertas para espaço em disco e performance

## 🆘 Solução de Problemas

### Container não inicia
```bash
# Verificar logs
npm run db:logs

# Resetar completamente
npm run db:reset
```

### Erro de conexão
- Verifique se o Docker está rodando
- Confirme as variáveis de ambiente
- Teste a conectividade na porta 5432

### Problemas de permissão
```bash
# No Windows, execute como administrador
# No Linux/Mac, verifique permissões do Docker
```
