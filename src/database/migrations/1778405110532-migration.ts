import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1778405110532 implements MigrationInterface {
    name = 'Migration1778405110532'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" RENAME COLUMN "moderationStatus" TO "status"`);
        await queryRunner.query(`ALTER TYPE "public"."offers_moderationstatus_enum" RENAME TO "offers_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."moderation_targettype_enum" AS ENUM('user', 'offer', 'comment')`);
        await queryRunner.query(`CREATE TYPE "public"."moderation_actiontype_enum" AS ENUM('warning', 'suspend', 'block', 'delete', 'restore')`);
        await queryRunner.query(`CREATE TABLE "moderation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "targetType" "public"."moderation_targettype_enum" NOT NULL, "targetId" character varying NOT NULL, "actionType" "public"."moderation_actiontype_enum" NOT NULL, "reason" text, "endsAt" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "adminId" uuid, CONSTRAINT "PK_f9bb6c3c7dd67cab981179220b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reports_type_enum" AS ENUM('spam', 'abuse', 'nsfw', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."reports_targettype_enum" AS ENUM('user', 'offer', 'comment')`);
        await queryRunner.query(`CREATE TYPE "public"."reports_status_enum" AS ENUM('pending', 'resolved', 'dismissed')`);
        await queryRunner.query(`CREATE TABLE "reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."reports_type_enum" NOT NULL, "description" text NOT NULL, "targetType" "public"."reports_targettype_enum" NOT NULL, "targetId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."reports_status_enum" NOT NULL DEFAULT 'pending', "reporterId" uuid, CONSTRAINT "PK_d9013193989303580053c0b5ef6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'suspended', 'banned', 'deleted')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "status" "public"."users_status_enum" NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "entityId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "moderation" ADD CONSTRAINT "FK_f22b9a914c8f283f6d8ff6ef281" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_4353be8309ce86650def2f8572d" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_4353be8309ce86650def2f8572d"`);
        await queryRunner.query(`ALTER TABLE "moderation" DROP CONSTRAINT "FK_f22b9a914c8f283f6d8ff6ef281"`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "entityId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TABLE "reports"`);
        await queryRunner.query(`DROP TYPE "public"."reports_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."reports_targettype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."reports_type_enum"`);
        await queryRunner.query(`DROP TABLE "moderation"`);
        await queryRunner.query(`DROP TYPE "public"."moderation_actiontype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."moderation_targettype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."offers_status_enum" RENAME TO "offers_moderationstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "offers" RENAME COLUMN "status" TO "moderationStatus"`);
    }

}
