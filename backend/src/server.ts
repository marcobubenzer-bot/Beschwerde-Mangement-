import type { FastifyRequest } from 'fastify';
import Fastify from 'fastify';
import { prisma } from './lib/prisma.js';
import { surveyRoutes } from './routes/survey.js';

type StatsRequestContext = {
  startedAtMs?: number;
};

const app = Fastify({ logger: true });

const isStatsRoute = (request: FastifyRequest) => request.url.split('?')[0].startsWith('/stats/');

const parseIsoDate = (value: unknown): Date | null => {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseAufnahmeartValues = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string');
  }

  if (typeof value === 'string' && value.length > 0) {
    return [value];
  }

  return [];
};

app.addHook('onRequest', async (request) => {
  if (!isStatsRoute(request)) {
    return;
  }

  (request as FastifyRequest & { statsContext?: StatsRequestContext }).statsContext = {
    startedAtMs: Date.now(),
  };
});

app.addHook('onResponse', async (request, reply) => {
  if (!isStatsRoute(request)) {
    return;
  }

  const context = (request as FastifyRequest & { statsContext?: StatsRequestContext }).statsContext;
  const durationMs = context?.startedAtMs ? Math.max(0, Date.now() - context.startedAtMs) : 0;

  const forwardedFor = request.headers['x-forwarded-for'];
  const clientIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0].trim()
      : request.ip;

  const rawQuery = (request.query as Record<string, unknown>) ?? {};

  void prisma.statsQueryLog
    .create({
      data: {
        method: request.method,
        path: request.routerPath ?? request.url,
        query: rawQuery,
        clientIp,
        userAgent: request.headers['user-agent'] ?? null,
        statusCode: reply.statusCode,
        durationMs,
        station: typeof rawQuery.station === 'string' ? rawQuery.station : null,
        filterFrom: parseIsoDate(rawQuery.from),
        filterTo: parseIsoDate(rawQuery.to),
        aufnahmeart: parseAufnahmeartValues(rawQuery.aufnahmeart),
      },
    })
    .catch((error) => {
      console.warn('Stats query logging failed', error);
    });
});

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
