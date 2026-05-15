import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1770963063173 implements MigrationInterface {
    name = 'Migration1770963063173'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "alert" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "businessId" uuid, CONSTRAINT "PK_ad91cad659a3536465d564a4b2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('PROFILE_UPDATED', 'OFFER_CREATED', 'PASSWORD_CHANGED', 'NEW_MESSAGE', 'OFFER_APPROVED', 'OFFER_REJECTED')`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "type" "public"."notification_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "entityId" character varying`);
        await queryRunner.query(`ALTER TABLE "alert" ADD CONSTRAINT "FK_c47ec76d2c5097d80eaae03853d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alert" ADD CONSTRAINT "FK_48e08a7f0a21456842e9a2b7184" FOREIGN KEY ("businessId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alert" DROP CONSTRAINT "FK_48e08a7f0a21456842e9a2b7184"`);
        await queryRunner.query(`ALTER TABLE "alert" DROP CONSTRAINT "FK_c47ec76d2c5097d80eaae03853d"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "entityId"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
        await queryRunner.query(`DROP TABLE "alert"`);
    }

}
