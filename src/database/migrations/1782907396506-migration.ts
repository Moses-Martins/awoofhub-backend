import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1782907396506 implements MigrationInterface {
    name = 'Migration1782907396506'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."offers_dealtype_enum" RENAME TO "offers_dealtype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."offers_dealtype_enum" AS ENUM('cashback', 'freebie', 'discount', 'bogo', 'promo_code', 'free_trial', 'free_delivery', 'price_drop')`);
        await queryRunner.query(`ALTER TABLE "offers" ALTER COLUMN "dealType" TYPE "public"."offers_dealtype_enum" USING "dealType"::"text"::"public"."offers_dealtype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."offers_dealtype_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."offers_dealtype_enum_old" AS ENUM('cashback', 'freebie', 'discount', 'bogo', 'promo_code', 'free_trial', 'free_delivery')`);
        await queryRunner.query(`ALTER TABLE "offers" ALTER COLUMN "dealType" TYPE "public"."offers_dealtype_enum_old" USING "dealType"::"text"::"public"."offers_dealtype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."offers_dealtype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."offers_dealtype_enum_old" RENAME TO "offers_dealtype_enum"`);
    }

}
