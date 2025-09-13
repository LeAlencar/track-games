import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Configuração da conexão com PostgreSQL
const connectionString = process.env.DATABASE_URL!;

// Criar cliente PostgreSQL
const client = postgres(connectionString, {
  max: 1,
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
});

// Criar instância do Drizzle ORM
export const db = drizzle(client);

// Função para fechar conexão
export const closeConnection = async () => {
  await client.end();
};
