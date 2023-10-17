/*
  Warnings:

  - You are about to drop the column `sharedURL` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the `FormSubmission` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[shareURL]` on the table `Form` will be added. If there are existing duplicate values, this will fail.
  - The required column `shareURL` was added to the `Form` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "FormSubmission" DROP CONSTRAINT "FormSubmission_formId_fkey";

-- AlterTable
ALTER TABLE "Form" DROP COLUMN "sharedURL",
ADD COLUMN     "shareURL" TEXT NOT NULL;

-- DropTable
DROP TABLE "FormSubmission";

-- CreateTable
CREATE TABLE "FormSubmissions" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "FormSubmissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Form_shareURL_key" ON "Form"("shareURL");

-- AddForeignKey
ALTER TABLE "FormSubmissions" ADD CONSTRAINT "FormSubmissions_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
