-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'USER', 'EDITOR');

-- CreateTable
CREATE TABLE "public"."cards" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "description" VARCHAR NOT NULL,
    "priority" VARCHAR NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "due_to" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "columnId" INTEGER,

    CONSTRAINT "PK_da6bb682664de7601d3f1a7cc5d" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."columns" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "PK_21313aea8746272ef0eb2294beb" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR NOT NULL,
    "last_name" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "hashed_refresh_token" VARCHAR,
    "avatar_url" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "PK_d72ea127f30e21753c9e229891e" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."cards" ADD CONSTRAINT "FK_5bbe21a70f96abfdf404f242409" FOREIGN KEY ("columnId") REFERENCES "public"."columns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."columns" ADD CONSTRAINT "FK_2bf3063d29ab36d6786542b6cf2" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
