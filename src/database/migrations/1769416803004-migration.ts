import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1769416803004 implements MigrationInterface {
    name = 'Migration1769416803004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user', 'business')`);
        await queryRunner.query(`CREATE TYPE "public"."users_businesscategory_enum" AS ENUM('Tech', 'Food', 'Events', 'Services')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "name" character varying NOT NULL, "password" character varying NOT NULL, "profile_image_url" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "is_email_verified" boolean NOT NULL DEFAULT false, "businessDescription" text, "socialLinks" json, "businessAddress" text, "businessEmail" text, "businessCategory" "public"."users_businesscategory_enum", "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rating" integer NOT NULL, "comment" character varying NOT NULL, "userId" uuid, "offerId" uuid, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."category_name_enum" AS ENUM('promocode', 'Cashback', 'freeby', 'pricedrop', 'voucher')`);
        await queryRunner.query(`CREATE TABLE "category" ("id" SERIAL NOT NULL, "name" "public"."category_name_enum" NOT NULL, CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."offers_approvalstatus_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "offers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" text NOT NULL, "description" text NOT NULL, "price" numeric NOT NULL DEFAULT '0', "image_url" character varying, "location" character varying, "approvalStatus" "public"."offers_approvalstatus_enum" NOT NULL DEFAULT 'pending', "admin_note" text, "approved_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "end_date" TIMESTAMP NOT NULL, "businessId" uuid, "categoryId" integer, "approvedById" uuid, CONSTRAINT "PK_4c88e956195bba85977da21b8f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "wishlist" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "offerId" uuid, CONSTRAINT "PK_620bff4a240d66c357b5d820eaa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_8ab911496670c2834289ed842ef" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_b52b5f90e90473d3f66530f5a16" FOREIGN KEY ("businessId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_be9924237a352f6e10375154edd" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_8dbbd595b159fb03d7401d3995d" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD CONSTRAINT "FK_f6eeb74a295e2aad03b76b0ba87" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD CONSTRAINT "FK_7d9fb366861ad3dc8668f7f5b8a" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wishlist" DROP CONSTRAINT "FK_7d9fb366861ad3dc8668f7f5b8a"`);
        await queryRunner.query(`ALTER TABLE "wishlist" DROP CONSTRAINT "FK_f6eeb74a295e2aad03b76b0ba87"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_8dbbd595b159fb03d7401d3995d"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_be9924237a352f6e10375154edd"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_b52b5f90e90473d3f66530f5a16"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_8ab911496670c2834289ed842ef"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f"`);
        await queryRunner.query(`DROP TABLE "wishlist"`);
        await queryRunner.query(`DROP TABLE "offers"`);
        await queryRunner.query(`DROP TYPE "public"."offers_approvalstatus_enum"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP TYPE "public"."category_name_enum"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_businesscategory_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
