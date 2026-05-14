import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1778582787664 implements MigrationInterface {
    name = 'Migration1778582787664'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."reports_type_enum" RENAME TO "reports_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."reports_type_enum" AS ENUM('spam', 'scam', 'abuse', 'explicit', 'violence', 'illegal', 'self_harm', 'other')`);
        await queryRunner.query(`ALTER TABLE "reports" ALTER COLUMN "type" TYPE "public"."reports_type_enum" USING "type"::"text"::"public"."reports_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."reports_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."reports_type_enum_old" AS ENUM('spam', 'abuse', 'nsfw', 'other')`);
        await queryRunner.query(`ALTER TABLE "reports" ALTER COLUMN "type" TYPE "public"."reports_type_enum_old" USING "type"::"text"::"public"."reports_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."reports_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."reports_type_enum_old" RENAME TO "reports_type_enum"`);
    }

}
