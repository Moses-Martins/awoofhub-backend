import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1773039936040 implements MigrationInterface {
    name = 'Migration1773039936040'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" ADD "slug" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70" UNIQUE ("slug")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70"`);
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "slug"`);
    }

}
