import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1778750274439 implements MigrationInterface {
    name = 'Migration1778750274439'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_0ed14d2309746329aaceb12618b"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "moderatedById"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "adminNote"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "statusUpdatedAt"`);
        await queryRunner.query(`ALTER TYPE "public"."moderation_actiontype_enum" RENAME TO "moderation_actiontype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."moderation_actiontype_enum" AS ENUM('warning', 'suspend', 'block', 'delete', 'activate')`);
        await queryRunner.query(`ALTER TABLE "moderation" ALTER COLUMN "actionType" TYPE "public"."moderation_actiontype_enum" USING "actionType"::"text"::"public"."moderation_actiontype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."moderation_actiontype_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."moderation_actiontype_enum_old" AS ENUM('warning', 'suspend', 'block', 'delete', 'restore')`);
        await queryRunner.query(`ALTER TABLE "moderation" ALTER COLUMN "actionType" TYPE "public"."moderation_actiontype_enum_old" USING "actionType"::"text"::"public"."moderation_actiontype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."moderation_actiontype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."moderation_actiontype_enum_old" RENAME TO "moderation_actiontype_enum"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "statusUpdatedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "adminNote" text`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "moderatedById" uuid`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_0ed14d2309746329aaceb12618b" FOREIGN KEY ("moderatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
