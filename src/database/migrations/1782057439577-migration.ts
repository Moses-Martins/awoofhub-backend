import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1782057439577 implements MigrationInterface {
    name = 'Migration1782057439577'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."offers_status_enum" RENAME TO "offers_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."offers_status_enum" AS ENUM('pending', 'approved', 'rejected', 'suspended')`);
        await queryRunner.query(`ALTER TABLE "offers" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "offers" ALTER COLUMN "status" TYPE "public"."offers_status_enum" USING "status"::"text"::"public"."offers_status_enum"`);
        await queryRunner.query(`ALTER TABLE "offers" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."offers_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."offers_status_enum_old" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "offers" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "offers" ALTER COLUMN "status" TYPE "public"."offers_status_enum_old" USING "status"::"text"::"public"."offers_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "offers" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."offers_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."offers_status_enum_old" RENAME TO "offers_status_enum"`);
    }

}
