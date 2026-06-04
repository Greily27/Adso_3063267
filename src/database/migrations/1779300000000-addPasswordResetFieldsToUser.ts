import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordResetFieldsToUser1779300000000
  implements MigrationInterface
{
  name = 'AddPasswordResetFieldsToUser1779300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "resetPasswordToken" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "resetPasswordTokenExpires" TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_resetPasswordToken" ON "user" ("resetPasswordToken")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_user_resetPasswordToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN IF EXISTS "resetPasswordTokenExpires"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN IF EXISTS "resetPasswordToken"`,
    );
  }
}
