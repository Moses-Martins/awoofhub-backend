import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1777392601596 implements MigrationInterface {
    name = 'Migration1777392601596'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_8dbbd595b159fb03d7401d3995d"`);
        await queryRunner.query(`ALTER TABLE "offers" RENAME COLUMN "approvedById" TO "moderatedById"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_0ed14d2309746329aaceb12618b" FOREIGN KEY ("moderatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_0ed14d2309746329aaceb12618b"`);
        await queryRunner.query(`ALTER TABLE "offers" RENAME COLUMN "moderatedById" TO "approvedById"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_8dbbd595b159fb03d7401d3995d" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
