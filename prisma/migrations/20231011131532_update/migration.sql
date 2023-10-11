/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Form` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Form" DROP COLUMN "updatedAt",
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;
