import Fastify from 'fastify';
import { prisma } from './lib/prisma.js';
import { surveyRoutes } from './routes/survey.js';

const app = Fastify({ logger: true });

app.register(surveyRoutes);

app.get('/health', async () => ({ status: 'ok' }));

const start = async () => {
  try {
    const port = Number(process.env.PORT ?? 3000);
    const host = process.env.HOST ?? '0.0.0.0';
    await app.listen({ host, port });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

const shutdown = async () => {
  await app.close();
  await prisma.$disconnect();
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

void start();
