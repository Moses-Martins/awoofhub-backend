import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1769510918794 implements MigrationInterface {
    name = 'Migration1769510918794'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_be9924237a352f6e10375154edd"`);
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03"`);
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "category" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "UQ_23c05c292c439d77b0de816b500" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "categoryId" uuid`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_be9924237a352f6e10375154edd" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_be9924237a352f6e10375154edd"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "categoryId" integer`);
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "UQ_23c05c292c439d77b0de816b500"`);
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03"`);
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "category" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_be9924237a352f6e10375154edd" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
