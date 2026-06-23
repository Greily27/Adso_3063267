import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropPromedioFromEstudiante1778800000000 implements MigrationInterface {
  name = 'DropPromedioFromEstudiante1778800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "estudiante" DROP COLUMN IF EXISTS "promedio"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "estudiante" ADD COLUMN IF NOT EXISTS "promedio" character varying(255) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "estudiante" ALTER COLUMN "promedio" DROP DEFAULT`,
    );
  }
}
