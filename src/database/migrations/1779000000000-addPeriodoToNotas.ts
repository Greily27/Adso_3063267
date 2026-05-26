import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPeriodoToNotas1779000000000 implements MigrationInterface {
  name = 'AddPeriodoToNotas1779000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notas" ADD COLUMN "periodo" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notas" DROP COLUMN IF EXISTS "periodo"`,
    );
  }
}
