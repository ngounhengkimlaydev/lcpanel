-- DropForeignKey
ALTER TABLE "git_project" DROP CONSTRAINT "git_project_connection_id_fkey";

-- AlterTable
ALTER TABLE "git_project" ALTER COLUMN "connection_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "git_project" ADD CONSTRAINT "git_project_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "git_connection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
