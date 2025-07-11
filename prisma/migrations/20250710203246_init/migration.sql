/*
  Warnings:

  - You are about to drop the column `lastPrompt` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `lastResponse` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "lastPrompt",
DROP COLUMN "lastResponse",
DROP COLUMN "updatedAt",
DROP COLUMN "userId";
