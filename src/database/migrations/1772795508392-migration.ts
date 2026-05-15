import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772795508392 implements MigrationInterface {
    name = 'Migration1772795508392'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" RENAME COLUMN "endDate" TO "createdAt"`);
        await queryRunner.query(`ALTER TABLE "category" ALTER COLUMN "createdAt" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" ALTER COLUMN "createdAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "category" RENAME COLUMN "createdAt" TO "endDate"`);
    }

}
