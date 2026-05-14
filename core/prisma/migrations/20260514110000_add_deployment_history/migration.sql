-- CreateTable
CREATE TABLE "deployment_history" (
    "id" SERIAL NOT NULL,
    "customer_id" BIGINT NOT NULL,
    "project_id" INTEGER NOT NULL,
    "project_name" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "commit_hash" TEXT,
    "commit_short" TEXT,
    "commit_message" TEXT,
    "author" TEXT,
    "status" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "environment" TEXT NOT NULL DEFAULT 'Production',
    "domain" TEXT,
    "install_time" TEXT,
    "build_time" TEXT,
    "deploy_time" TEXT,
    "duration_ms" INTEGER,
    "plan_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deployment_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_deployment_history_customer_created_at" ON "deployment_history"("customer_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_deployment_history_project_created_at" ON "deployment_history"("project_id", "created_at");

-- AddForeignKey
ALTER TABLE "deployment_history" ADD CONSTRAINT "deployment_history_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployment_history" ADD CONSTRAINT "deployment_history_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "git_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
