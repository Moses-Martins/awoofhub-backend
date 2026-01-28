import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1769525858971 implements MigrationInterface {
    name = 'Migration1769525858971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_b52b5f90e90473d3f66530f5a16"`);
        await queryRunner.query(`ALTER TABLE "offers" RENAME COLUMN "businessId" TO "business"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_fb6539d0d37ff4ba0689655b780" FOREIGN KEY ("business") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_fb6539d0d37ff4ba0689655b780"`);
        await queryRunner.query(`ALTER TABLE "offers" RENAME COLUMN "business" TO "businessId"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_b52b5f90e90473d3f66530f5a16" FOREIGN KEY ("businessId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
