import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1778409137301 implements MigrationInterface {
    name = 'Migration1778409137301'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "moderation" DROP COLUMN "reportId"`);
        await queryRunner.query(`ALTER TABLE "moderation" ADD "reportId" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "moderation" DROP COLUMN "reportId"`);
        await queryRunner.query(`ALTER TABLE "moderation" ADD "reportId" character varying`);
    }

}
