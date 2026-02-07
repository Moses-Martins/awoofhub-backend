import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1770373972998 implements MigrationInterface {
    name = 'Migration1770373972998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "FK_96de87fa2e114a3973cfb9f0435"`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP COLUMN "offerId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" ADD "offerId" uuid`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "FK_96de87fa2e114a3973cfb9f0435" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
