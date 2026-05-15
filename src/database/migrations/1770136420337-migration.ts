import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1770136420337 implements MigrationInterface {
    name = 'Migration1770136420337'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "businessDescription"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "socialLinks"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "businessAddress"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "businessEmail"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "businessCategory"`);
        await queryRunner.query(`DROP TYPE "public"."users_businesscategory_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."users_auth_provider_enum" AS ENUM('google', 'local')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "auth_provider" "public"."users_auth_provider_enum" NOT NULL DEFAULT 'local'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "address" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_description" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "social_links" json`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_email" text`);
        await queryRunner.query(`CREATE TYPE "public"."users_business_category_enum" AS ENUM('Tech', 'Food', 'Events', 'Services')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_category" "public"."users_business_category_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_category"`);
        await queryRunner.query(`DROP TYPE "public"."users_business_category_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_email"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "social_links"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_description"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "auth_provider"`);
        await queryRunner.query(`DROP TYPE "public"."users_auth_provider_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."users_businesscategory_enum" AS ENUM('Tech', 'Food', 'Events', 'Services')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "businessCategory" "public"."users_businesscategory_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "businessEmail" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "businessAddress" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "socialLinks" json`);
        await queryRunner.query(`ALTER TABLE "users" ADD "businessDescription" text`);
    }

}
