import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772794303036 implements MigrationInterface {
    name = 'Migration1772794303036'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" RENAME COLUMN "price" TO "highlight"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "highlight"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "highlight" text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "highlight"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "highlight" numeric NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "offers" RENAME COLUMN "highlight" TO "price"`);
    }

}
