import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1781252061956 implements MigrationInterface {
    name = 'Migration1781252061956'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "clicks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "offerId" uuid, CONSTRAINT "PK_7765d7ffdeb0ed2675651020814" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "clicks" ADD CONSTRAINT "FK_134611101f09e79714e52e9efe8" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clicks" ADD CONSTRAINT "FK_460f7b27b64b092a273c6f57536" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clicks" DROP CONSTRAINT "FK_460f7b27b64b092a273c6f57536"`);
        await queryRunner.query(`ALTER TABLE "clicks" DROP CONSTRAINT "FK_134611101f09e79714e52e9efe8"`);
        await queryRunner.query(`DROP TABLE "clicks"`);
    }

}
