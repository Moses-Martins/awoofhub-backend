import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772204884238 implements MigrationInterface {
    name = 'Migration1772204884238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profile_image_url"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_email_verified"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "auth_provider"`);
        await queryRunner.query(`DROP TYPE "public"."users_auth_provider_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_description"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "social_links"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_email"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_category"`);
        await queryRunner.query(`DROP TYPE "public"."users_business_category_enum"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "image_url"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "admin_note"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "approved_at"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "end_date"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "profileImageUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isEmailVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE TYPE "public"."users_authprovider_enum" AS ENUM('google', 'local')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "authProvider" "public"."users_authprovider_enum" NOT NULL DEFAULT 'local'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "bio" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "website" json`);
        await queryRunner.query(`ALTER TABLE "users" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "imageUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "adminNote" text`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "approvedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "endDate" TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "endDate"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "approvedAt"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "adminNote"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "imageUrl"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "website"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bio"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "authProvider"`);
        await queryRunner.query(`DROP TYPE "public"."users_authprovider_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isEmailVerified"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profileImageUrl"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "end_date" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "approved_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "admin_note" text`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "image_url" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."users_business_category_enum" AS ENUM('Tech', 'Food', 'Events', 'Services')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_category" "public"."users_business_category_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_email" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "social_links" json`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_description" text`);
        await queryRunner.query(`CREATE TYPE "public"."users_auth_provider_enum" AS ENUM('google', 'local')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "auth_provider" "public"."users_auth_provider_enum" NOT NULL DEFAULT 'local'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_email_verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "profile_image_url" character varying`);
    }

}
