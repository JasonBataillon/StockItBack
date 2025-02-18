/*
  Warnings:

  - A unique constraint covering the columns `[userId,stockId]` on the table `Watchlist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_userId_stockId_key" ON "Watchlist"("userId", "stockId");
