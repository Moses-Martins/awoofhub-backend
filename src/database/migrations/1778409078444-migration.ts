import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1778409078444 implements MigrationInterface {
    name = 'Migration1778409078444'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "moderation" ADD "reportId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "moderation" DROP COLUMN "reportId"`);
    }

}
