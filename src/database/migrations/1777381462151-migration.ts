import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1777381462151 implements MigrationInterface {
    name = 'Migration1777381462151'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" RENAME COLUMN "approvedAt" TO "statusUpdatedAt"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" RENAME COLUMN "statusUpdatedAt" TO "approvedAt"`);
    }

}
