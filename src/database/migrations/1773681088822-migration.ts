import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1773681088822 implements MigrationInterface {
    name = 'Migration1773681088822'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "createdAt"`);
    }

}
