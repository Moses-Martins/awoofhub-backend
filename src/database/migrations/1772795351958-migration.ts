import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772795351958 implements MigrationInterface {
    name = 'Migration1772795351958'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" ADD "endDate" TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "endDate"`);
    }

}
