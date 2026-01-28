import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1769510659866 implements MigrationInterface {
    name = 'Migration1769510659866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "name"`);
        await queryRunner.query(`DROP TYPE "public"."category_name_enum"`);
        await queryRunner.query(`ALTER TABLE "category" ADD "name" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "name"`);
        await queryRunner.query(`CREATE TYPE "public"."category_name_enum" AS ENUM('promocode', 'Cashback', 'freeby', 'pricedrop', 'voucher')`);
        await queryRunner.query(`ALTER TABLE "category" ADD "name" "public"."category_name_enum" NOT NULL`);
    }

}
