import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1781528392921 implements MigrationInterface {
    name = 'Migration1781528392921'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alert" DROP CONSTRAINT "FK_48e08a7f0a21456842e9a2b7184"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_b52b5f90e90473d3f66530f5a16"`);
        await queryRunner.query(`ALTER TABLE "alert" RENAME COLUMN "businessId" TO "contributorId"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "businessId"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "termsAndConditions"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "dealUrl"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "externalLink" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "brandName" text NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."offers_dealtype_enum" AS ENUM('cashback', 'freebie', 'discount', 'bogo', 'promo_code', 'free_trial', 'free_delivery')`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "dealType" "public"."offers_dealtype_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "contributorId" uuid`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "imageUrl"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "imageUrl" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "alert" ADD CONSTRAINT "FK_ece538d90c2f4665854fad4e87f" FOREIGN KEY ("contributorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_cbc0737aad50e3934e87f99b495" FOREIGN KEY ("contributorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_cbc0737aad50e3934e87f99b495"`);
        await queryRunner.query(`ALTER TABLE "alert" DROP CONSTRAINT "FK_ece538d90c2f4665854fad4e87f"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "imageUrl"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "imageUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "contributorId"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "dealType"`);
        await queryRunner.query(`DROP TYPE "public"."offers_dealtype_enum"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "brandName"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "externalLink"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "dealUrl" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "termsAndConditions" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "businessId" uuid`);
        await queryRunner.query(`ALTER TABLE "alert" RENAME COLUMN "contributorId" TO "businessId"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_b52b5f90e90473d3f66530f5a16" FOREIGN KEY ("businessId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alert" ADD CONSTRAINT "FK_48e08a7f0a21456842e9a2b7184" FOREIGN KEY ("businessId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
