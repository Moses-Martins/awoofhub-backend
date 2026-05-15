import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1773555207059 implements MigrationInterface {
    name = 'Migration1773555207059'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" ADD "termsAndConditions" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "value" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "dealUrl" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "couponCode" character varying`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "location"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "location" text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "location"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "location" character varying`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "couponCode"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "dealUrl"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "value"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "termsAndConditions"`);
    }

}
