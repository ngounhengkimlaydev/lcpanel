-- CreateTable
CREATE TABLE "module" (
    "id" SERIAL NOT NULL,
    "module_name" TEXT NOT NULL,
    "module_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission" (
    "id" SERIAL NOT NULL,
    "permission_name" TEXT NOT NULL,
    "module_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_type" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ip_address" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "ip_address" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ip_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "role_name" TEXT NOT NULL,
    "role_desc" TEXT,
    "user_type_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "role_id" INTEGER NOT NULL,
    "user_type_id" INTEGER NOT NULL,
    "auth_token" TEXT,
    "last_login" TIMESTAMP(3),
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" BIGSERIAL NOT NULL,
    "user_type_id" INTEGER NOT NULL DEFAULT 6,
    "role_id" INTEGER NOT NULL DEFAULT 2,
    "code" TEXT,
    "image" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "gender" INTEGER,
    "password" TEXT,
    "google" TEXT,
    "apple_id" TEXT,
    "firebase_uid" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_module" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "module_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_log" (
    "id" SERIAL NOT NULL,
    "log_name" TEXT,
    "description" TEXT NOT NULL,
    "subject_type" TEXT,
    "event" TEXT,
    "subject_id" INTEGER,
    "causer_type" TEXT,
    "causer_id" INTEGER,
    "properties" JSONB,
    "batch_uuid" CHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "git_connection" (
    "id" BIGSERIAL NOT NULL,
    "customer_id" BIGINT NOT NULL,
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
    "customer_id" BIGINT NOT NULL,
    "connection_id" BIGINT,
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

    CONSTRAINT "git_project_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "plans" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "cpu" DOUBLE PRECISION,
    "ram" INTEGER,
    "disk_space" INTEGER NOT NULL,
    "domain" INTEGER NOT NULL,
    "email" INTEGER,
    "ssl" BOOLEAN NOT NULL DEFAULT true,
    "database" INTEGER NOT NULL,
    "website" INTEGER NOT NULL DEFAULT 1,
    "ftp_account" INTEGER DEFAULT 1,
    "cronjob" INTEGER DEFAULT 0,
    "backup" BOOLEAN DEFAULT false,
    "cdn" BOOLEAN DEFAULT false,
    "staging" BOOLEAN DEFAULT false,
    "ssh_access" BOOLEAN DEFAULT false,
    "docker_support" BOOLEAN DEFAULT false,
    "bandwidth" DOUBLE PRECISION NOT NULL,
    "type" SMALLINT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" BIGSERIAL NOT NULL,
    "customer_id" BIGINT NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "customer_id" BIGINT NOT NULL,
    "subscription_id" BIGINT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "due_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_permission_module_id" ON "permission"("module_id");

-- CreateIndex
CREATE INDEX "idx_role_user_type_id_fkey" ON "role"("user_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "idx_users_role_id" ON "users"("role_id");

-- CreateIndex
CREATE INDEX "idx_users_user_type_id" ON "users"("user_type_id");

-- CreateIndex
CREATE INDEX "customer_user_type_id_role_id_idx" ON "customer"("user_type_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_phone_email_key" ON "customer"("phone", "email");

-- CreateIndex
CREATE INDEX "idx_role_module_module_id_fkey" ON "role_module"("module_id");

-- CreateIndex
CREATE INDEX "idx_role_module_permission_id_fkey" ON "role_module"("permission_id");

-- CreateIndex
CREATE INDEX "idx_role_module_role_id_fkey" ON "role_module"("role_id");

-- CreateIndex
CREATE INDEX "subject" ON "user_log"("subject_type", "subject_id");

-- CreateIndex
CREATE INDEX "causer" ON "user_log"("causer_type", "causer_id");

-- CreateIndex
CREATE INDEX "activity_log_log_name_index" ON "user_log"("log_name");

-- CreateIndex
CREATE INDEX "git_connection_customer_id_idx" ON "git_connection"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "git_connection_customer_id_provider_key" ON "git_connection"("customer_id", "provider");

-- CreateIndex
CREATE INDEX "git_project_customer_id_connection_id_idx" ON "git_project"("customer_id", "connection_id");

-- CreateIndex
CREATE UNIQUE INDEX "git_project_customer_id_provider_provider_repo_id_key" ON "git_project"("customer_id", "provider", "provider_repo_id");

-- CreateIndex
CREATE INDEX "idx_deployment_history_customer_created_at" ON "deployment_history"("customer_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_deployment_history_project_created_at" ON "deployment_history"("project_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_customer_id_key" ON "subscriptions"("customer_id");

-- CreateIndex
CREATE INDEX "subscriptions_customer_id_plan_id_idx" ON "subscriptions"("customer_id", "plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_code_key" ON "invoices"("code");

-- CreateIndex
CREATE INDEX "invoices_customer_id_idx" ON "invoices"("customer_id");

-- AddForeignKey
ALTER TABLE "permission" ADD CONSTRAINT "permission_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_user_type_id_fkey" FOREIGN KEY ("user_type_id") REFERENCES "user_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_user_type_id_fkey" FOREIGN KEY ("user_type_id") REFERENCES "user_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_user_type_id_fkey" FOREIGN KEY ("user_type_id") REFERENCES "user_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_module" ADD CONSTRAINT "role_module_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_module" ADD CONSTRAINT "role_module_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_module" ADD CONSTRAINT "role_module_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "git_connection" ADD CONSTRAINT "git_connection_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "git_project" ADD CONSTRAINT "git_project_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "git_connection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "git_project" ADD CONSTRAINT "git_project_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployment_history" ADD CONSTRAINT "deployment_history_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployment_history" ADD CONSTRAINT "deployment_history_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "git_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
