/*
  Warnings:

  - The primary key for the `OwnedStock` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `OwnedStock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OwnedStock" DROP CONSTRAINT "OwnedStock_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "OwnedStock_pkey" PRIMARY KEY ("userId", "stockId");
