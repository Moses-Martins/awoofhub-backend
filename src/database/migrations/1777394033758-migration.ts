import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1777394033758 implements MigrationInterface {
    name = 'Migration1777394033758'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" RENAME COLUMN "approvalStatus" TO "moderationStatus"`);
        await queryRunner.query(`ALTER TYPE "public"."offers_approvalstatus_enum" RENAME TO "offers_moderationstatus_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."offers_moderationstatus_enum" RENAME TO "offers_approvalstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "offers" RENAME COLUMN "moderationStatus" TO "approvalStatus"`);
    }

}
