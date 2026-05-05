-- CreateTable
CREATE TABLE "module" (
    "id" SERIAL NOT NULL,
    "module_name" TEXT NOT NULL,
    "module_key" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sequence" INTEGER,
    "menu_title" TEXT,
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
    "branch_id" INTEGER,
    "company_id" INTEGER,
    "auth_token" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" SERIAL NOT NULL,
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
    "status" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_device" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "device_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "fcm_token" TEXT NOT NULL,
    "is_login" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" INTEGER,

    CONSTRAINT "customer_device_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "customer_device_customer_id_idx" ON "customer_device"("customer_id");

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

-- AddForeignKey
ALTER TABLE "permission" ADD CONSTRAINT "permission_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_user_type_id_fkey" FOREIGN KEY ("user_type_id") REFERENCES "user_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_user_type_id_fkey" FOREIGN KEY ("user_type_id") REFERENCES "user_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_device" ADD CONSTRAINT "customer_device_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_module" ADD CONSTRAINT "role_module_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_module" ADD CONSTRAINT "role_module_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_module" ADD CONSTRAINT "role_module_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
