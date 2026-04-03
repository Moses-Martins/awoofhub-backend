import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1775217182432 implements MigrationInterface {
    name = 'Migration1775217182432'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "highlight"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" ADD "highlight" text NOT NULL`);
    }

}
