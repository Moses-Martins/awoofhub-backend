import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1779889290792 implements MigrationInterface {
    name = 'Migration1779889290792'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "website"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "website" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "website"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "website" json`);
    }

}
