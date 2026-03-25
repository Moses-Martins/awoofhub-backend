import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1774360767481 implements MigrationInterface {
    name = 'Migration1774360767481'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" RENAME COLUMN "read" TO "isRead"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" RENAME COLUMN "isRead" TO "read"`);
    }

}
