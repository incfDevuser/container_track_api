-- CreateTable
CREATE TABLE "InterestArea" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "polygon" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterestArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AreaPoint" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "estimatedAt" TIMESTAMP(3),
    "isInsideArea" BOOLEAN NOT NULL,
    "isVehicleInPoint" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AreaPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterestArea_companyId_idx" ON "InterestArea"("companyId");

-- CreateIndex
CREATE INDEX "InterestArea_isActive_idx" ON "InterestArea"("isActive");

-- CreateIndex
CREATE INDEX "AreaPoint_areaId_idx" ON "AreaPoint"("areaId");

-- CreateIndex
CREATE INDEX "AreaPoint_estimatedAt_idx" ON "AreaPoint"("estimatedAt");

-- AddForeignKey
ALTER TABLE "InterestArea" ADD CONSTRAINT "InterestArea_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "TransportCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaPoint" ADD CONSTRAINT "AreaPoint_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "InterestArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
