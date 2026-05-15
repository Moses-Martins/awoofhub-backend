import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1770371959557 implements MigrationInterface {
    name = 'Migration1770371959557'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "conversationId" uuid, "senderId" uuid, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "conversation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "initiatorId" uuid, "participantId" uuid, "offerId" uuid, CONSTRAINT "PK_864528ec4274360a40f66c29845" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "FK_dcfebc3b0e491a2e17cf5421e35" FOREIGN KEY ("initiatorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "FK_e34f5680702b755b819d4a17106" FOREIGN KEY ("participantId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "FK_96de87fa2e114a3973cfb9f0435" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "FK_96de87fa2e114a3973cfb9f0435"`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "FK_e34f5680702b755b819d4a17106"`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "FK_dcfebc3b0e491a2e17cf5421e35"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f"`);
        await queryRunner.query(`DROP TABLE "conversation"`);
        await queryRunner.query(`DROP TABLE "message"`);
    }

}
