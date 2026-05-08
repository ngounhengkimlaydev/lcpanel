/*
  Warnings:

  - You are about to drop the column `branch_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `company_id` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "branch_id",
DROP COLUMN "company_id",
ADD COLUMN     "last_login" TIMESTAMP(3);
