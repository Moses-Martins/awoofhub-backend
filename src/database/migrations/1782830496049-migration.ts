import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1782830496049 implements MigrationInterface {
    name = 'Migration1782830496049'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notification_entitytype_enum" AS ENUM('offer', 'user')`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "entityType" "public"."notification_entitytype_enum" NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."notification_type_enum" RENAME TO "notification_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('user_suspended', 'offer_pending', 'offer_alert', 'offer_approved', 'offer_rejected', 'offer_suspended', 'offer_expiring', 'offer_expired')`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "type" TYPE "public"."notification_type_enum" USING "type"::"text"::"public"."notification_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum_old" AS ENUM('PROFILE_UPDATED', 'OFFER_CREATED', 'PASSWORD_CHANGED', 'OFFER_APPROVED', 'OFFER_REJECTED')`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "type" TYPE "public"."notification_type_enum_old" USING "type"::"text"::"public"."notification_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."notification_type_enum_old" RENAME TO "notification_type_enum"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "entityType"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entitytype_enum"`);
    }

}
