-- AlterTable
ALTER TABLE "User" ADD COLUMN     "wallet" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- CreateTable
CREATE TABLE "OwnedStock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "shares" INTEGER NOT NULL,
    "avgPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OwnedStock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OwnedStock" ADD CONSTRAINT "OwnedStock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedStock" ADD CONSTRAINT "OwnedStock_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
