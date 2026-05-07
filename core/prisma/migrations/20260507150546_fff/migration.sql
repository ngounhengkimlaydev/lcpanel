/*
  Warnings:

  - You are about to drop the column `featured` on the `module` table. All the data in the column will be lost.
  - You are about to drop the column `menu_title` on the `module` table. All the data in the column will be lost.
  - You are about to drop the column `sequence` on the `module` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "module" DROP COLUMN "featured",
DROP COLUMN "menu_title",
DROP COLUMN "sequence";
