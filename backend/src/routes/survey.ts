import { Prisma } from '@prisma/client';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { mapAufnahmeart, parseQuestionNo, scoreToOption } from '../lib/survey.js';

const likertSchema = z.record(z.number().int().min(1).max(5)).default({});

const surveyBodySchema = z.object({
  station: z.string().min(1),
  zimmer: z.string().min(1),
  aufnahmeart: z.array(z.string()).default([]),
  q31: z.string().optional(),
  q32: z.string().optional(),
  q33: z.number().int().optional(),
  freitext: z.string().optional(),
  contactRequested: z.boolean().default(false),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  likert: likertSchema,
});

const statsFilterSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  station: z.string().optional(),
  aufnahmeart: z.union([z.string(), z.array(z.string())]).optional(),
});

type StatsFilterInput = z.infer<typeof statsFilterSchema>;

const badRequest = (reply: { code: (statusCode: number) => { send: (body: unknown) => unknown } }, message: unknown) =>
  reply.code(400).send({ message });

const buildResponseWhere = (input: StatsFilterInput): Prisma.SurveyResponseWhereInput => {
  const where: Prisma.SurveyResponseWhereInput = {};

  if (input.from || input.to) {
    where.createdAt = {
      gte: input.from ? new Date(input.from) : undefined,
      lte: input.to ? new Date(input.to) : undefined,
    };
  }

  if (input.station) {
    where.station = input.station;
  }

  if (input.aufnahmeart) {
    const rawValues = Array.isArray(input.aufnahmeart) ? input.aufnahmeart : [input.aufnahmeart];
    where.aufnahmeart = { hasSome: mapAufnahmeart(rawValues) };
  }

  return where;
};

export const surveyRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/survey', async (request, reply) => {
    const parsed = surveyBodySchema.safeParse(request.body);

    if (!parsed.success) {
      return badRequest(reply, parsed.error.flatten());
    }

    const likertAnswers: Array<{ questionNo: number; score: number; option: ReturnType<typeof scoreToOption> }> = [];

    for (const [key, score] of Object.entries(parsed.data.likert)) {
      const questionNo = parseQuestionNo(key);

      if (!questionNo || questionNo < 1 || questionNo > 30) {
        return badRequest(reply, `Invalid Likert key ${key}. Allowed q1..q30.`);
      }

      if (score < 1 || score > 5) {
        return badRequest(reply, `Invalid score for ${key}. Allowed 1..5.`);
      }

      likertAnswers.push({
        questionNo,
        score,
        option: scoreToOption(score),
      });
    }

    const forwardedFor = request.headers['x-forwarded-for'];
    const clientIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0].trim()
        : request.ip;

    const created = await prisma.surveyResponse.create({
      data: {
        station: parsed.data.station,
        zimmer: parsed.data.zimmer,
        aufnahmeart: mapAufnahmeart(parsed.data.aufnahmeart),
        q31: parsed.data.q31,
        q32: parsed.data.q32,
        q33: parsed.data.q33,
        freitext: parsed.data.freitext,
        contactRequested: parsed.data.contactRequested,
        contactName: parsed.data.contactName,
        contactEmail: parsed.data.contactEmail,
        contactPhone: parsed.data.contactPhone,
        clientIp,
        userAgent: request.headers['user-agent'] ?? null,
        likertAnswers: {
          createMany: {
            data: likertAnswers,
          },
        },
      },
      include: {
        likertAnswers: {
          orderBy: { questionNo: 'asc' },
        },
      },
    });

    return reply.code(201).send(created);
  });

  fastify.get('/survey/:id', async (request, reply) => {
    const paramsSchema = z.object({ id: z.string().min(1) });
    const paramsResult = paramsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      return badRequest(reply, paramsResult.error.flatten());
    }

    const response = await prisma.surveyResponse.findUnique({
      where: { id: paramsResult.data.id },
      include: {
        likertAnswers: {
          orderBy: { questionNo: 'asc' },
        },
      },
    });

    if (!response) {
      return reply.code(404).send({ message: 'Survey response not found' });
    }

    return response;
  });

  fastify.get('/stats/questions', async (request, reply) => {
    const parsed = statsFilterSchema.safeParse(request.query);
    if (!parsed.success) {
      return badRequest(reply, parsed.error.flatten());
    }

    const responseWhere = buildResponseWhere(parsed.data);

    const rows = await prisma.surveyLikertAnswer.groupBy({
      by: ['questionNo'],
      where: {
        response: responseWhere,
      },
      _avg: {
        score: true,
      },
      _count: {
        score: true,
      },
      orderBy: {
        questionNo: 'asc',
      },
    });

    return rows.map((row) => ({
      questionNo: row.questionNo,
      avgScore: row._avg.score,
      countAnswers: row._count.score,
    }));
  });

  fastify.get('/stats/overall', async (request, reply) => {
    const parsed = statsFilterSchema.safeParse(request.query);
    if (!parsed.success) {
      return badRequest(reply, parsed.error.flatten());
    }

    const responseWhere = buildResponseWhere(parsed.data);

    const aggregate = await prisma.surveyLikertAnswer.aggregate({
      where: {
        response: responseWhere,
      },
      _avg: { score: true },
      _count: { _all: true },
    });

    const totalResponsesWithLikert = await prisma.surveyResponse.count({
      where: {
        ...responseWhere,
        likertAnswers: {
          some: {},
        },
      },
    });

    const whereSql = Prisma.sql`
      WHERE 1=1
      ${parsed.data.from ? Prisma.sql`AND r."createdAt" >= ${new Date(parsed.data.from)}` : Prisma.empty}
      ${parsed.data.to ? Prisma.sql`AND r."createdAt" <= ${new Date(parsed.data.to)}` : Prisma.empty}
      ${parsed.data.station ? Prisma.sql`AND r."station" = ${parsed.data.station}` : Prisma.empty}
      ${parsed.data.aufnahmeart
        ? Prisma.sql`AND r."aufnahmeart" && ${mapAufnahmeart(Array.isArray(parsed.data.aufnahmeart) ? parsed.data.aufnahmeart : [parsed.data.aufnahmeart])}::text[]`
        : Prisma.empty}
    `;

    const meanRows = await prisma.$queryRaw<{ mean_of_response_averages: number | null }[]>(Prisma.sql`
      WITH response_avg AS (
        SELECT la."responseId" AS response_id, AVG(la.score)::float8 AS avg_score
        FROM "SurveyLikertAnswer" la
        JOIN "SurveyResponse" r ON r.id = la."responseId"
        ${whereSql}
        GROUP BY la."responseId"
      )
      SELECT AVG(avg_score)::float8 AS mean_of_response_averages
      FROM response_avg
    `);

    return {
      weightedAvgScore: aggregate._avg.score,
      totalAnswers: aggregate._count._all,
      totalResponsesWithLikert,
      meanOfResponseAverages: meanRows[0]?.mean_of_response_averages ?? null,
    };
  });
};
