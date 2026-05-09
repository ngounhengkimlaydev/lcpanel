-- CreateTable
CREATE TABLE "git_connection" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "username" TEXT,
    "avatar_url" TEXT,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "scope" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "customerId" INTEGER,

    CONSTRAINT "git_connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "git_project" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "connection_id" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_repo_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "clone_url" TEXT NOT NULL,
    "ssh_url" TEXT,
    "html_url" TEXT,
    "default_branch" TEXT,
    "local_path" TEXT,
    "status" TEXT NOT NULL DEFAULT 'imported',
    "last_pulled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "customerId" INTEGER,

    CONSTRAINT "git_project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "git_connection_customer_id_idx" ON "git_connection"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "git_connection_customer_id_provider_key" ON "git_connection"("customer_id", "provider");

-- CreateIndex
CREATE INDEX "git_project_customer_id_connection_id_idx" ON "git_project"("customer_id", "connection_id");

-- CreateIndex
CREATE UNIQUE INDEX "git_project_customer_id_provider_provider_repo_id_key" ON "git_project"("customer_id", "provider", "provider_repo_id");

-- AddForeignKey
ALTER TABLE "git_connection" ADD CONSTRAINT "git_connection_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "git_project" ADD CONSTRAINT "git_project_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "git_connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "git_project" ADD CONSTRAINT "git_project_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
