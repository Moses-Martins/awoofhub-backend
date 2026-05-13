import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1778625662219 implements MigrationInterface {
    name = 'Migration1778625662219'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'suspended', 'blocked', 'deleted')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "status" "public"."users_status_enum" NOT NULL DEFAULT 'active'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    }

}
