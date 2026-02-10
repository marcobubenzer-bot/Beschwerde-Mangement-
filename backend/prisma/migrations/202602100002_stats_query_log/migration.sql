-- CreateTable
CREATE TABLE "StatsQueryLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "query" JSONB NOT NULL,
    "clientIp" TEXT,
    "userAgent" TEXT,
    "statusCode" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "station" TEXT,
    "filterFrom" TIMESTAMP(3),
    "filterTo" TIMESTAMP(3),
    "aufnahmeart" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "StatsQueryLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StatsQueryLog_createdAt_idx" ON "StatsQueryLog"("createdAt");
CREATE INDEX "StatsQueryLog_path_createdAt_idx" ON "StatsQueryLog"("path", "createdAt");
