-- CreateEnum
CREATE TYPE "LikertOption" AS ENUM ('SEHR_SCHLECHT', 'SCHLECHT', 'MITTEL', 'GUT', 'SEHR_GUT');

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "station" TEXT NOT NULL,
    "zimmer" TEXT NOT NULL,
    "aufnahmeart" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "q31" TEXT,
    "q32" TEXT,
    "q33" INTEGER,
    "freitext" TEXT,
    "contactRequested" BOOLEAN NOT NULL DEFAULT false,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "clientIp" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyLikertAnswer" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "questionNo" INTEGER NOT NULL,
    "option" "LikertOption" NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "SurveyLikertAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyComplaint" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "responseId" TEXT,
    "description" TEXT,
    "status" TEXT DEFAULT 'OPEN',

    CONSTRAINT "SurveyComplaint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SurveyResponse_createdAt_idx" ON "SurveyResponse"("createdAt");

-- CreateIndex
CREATE INDEX "SurveyResponse_station_createdAt_idx" ON "SurveyResponse"("station", "createdAt");

-- CreateIndex
CREATE INDEX "SurveyResponse_aufnahmeart_gin_idx" ON "SurveyResponse" USING GIN ("aufnahmeart");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyLikertAnswer_responseId_questionNo_key" ON "SurveyLikertAnswer"("responseId", "questionNo");

-- CreateIndex
CREATE INDEX "SurveyLikertAnswer_responseId_idx" ON "SurveyLikertAnswer"("responseId");

-- CreateIndex
CREATE INDEX "SurveyLikertAnswer_questionNo_idx" ON "SurveyLikertAnswer"("questionNo");

-- CreateIndex
CREATE INDEX "SurveyLikertAnswer_responseId_questionNo_idx" ON "SurveyLikertAnswer"("responseId", "questionNo");

-- CreateIndex
CREATE INDEX "SurveyComplaint_responseId_idx" ON "SurveyComplaint"("responseId");

-- AddForeignKey
ALTER TABLE "SurveyLikertAnswer" ADD CONSTRAINT "SurveyLikertAnswer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "SurveyResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyComplaint" ADD CONSTRAINT "SurveyComplaint_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "SurveyResponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
