-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('active', 'archived', 'draft');

-- CreateEnum
CREATE TYPE "QRStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'pending', 'disabled');

-- CreateEnum
CREATE TYPE "QRType" AS ENUM ('url');

-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('week', 'month', 'year');

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'user',
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planType" "SubscriptionType" NOT NULL DEFAULT 'week',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3),
    "reference" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerSubscriptionId" TEXT,
    "providerCustomerId" TEXT,
    "providerAuthCode" TEXT,
    "cardBrand" TEXT,
    "last4" TEXT,
    "expMonth" INTEGER,
    "expYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRCode" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "QRType" NOT NULL,
    "name" TEXT,
    "payload" JSONB NOT NULL,
    "status" "QRStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QRCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRScan" (
    "id" TEXT NOT NULL,
    "qrId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "visitorId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "city" TEXT,
    "device" TEXT,
    "os" TEXT,
    "browser" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QRScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Project_userId_createdAt_idx" ON "Project"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Project_userId_status_createdAt_idx" ON "Project"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "QRCode_projectId_idx" ON "QRCode"("projectId");

-- CreateIndex
CREATE INDEX "QRScan_qrId_createdAt_idx" ON "QRScan"("qrId", "createdAt");

-- CreateIndex
CREATE INDEX "QRScan_projectId_createdAt_idx" ON "QRScan"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "QRScan_visitorId_idx" ON "QRScan"("visitorId");

-- CreateIndex
CREATE INDEX "QRScan_country_idx" ON "QRScan"("country");

-- CreateIndex
CREATE INDEX "QRScan_os_idx" ON "QRScan"("os");

-- CreateIndex
CREATE INDEX "QRScan_device_idx" ON "QRScan"("device");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_type_key" ON "Plan"("type");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRScan" ADD CONSTRAINT "QRScan_qrId_fkey" FOREIGN KEY ("qrId") REFERENCES "QRCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
