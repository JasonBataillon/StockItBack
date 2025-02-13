/*
  Warnings:

  - You are about to drop the column `addedAt` on the `Watchlist` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Watchlist` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Watchlist` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Watchlist" DROP COLUMN "addedAt",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";
