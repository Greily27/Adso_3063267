import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEstudianteCursoFieldsToNotas1778200000000
  implements MigrationInterface
{
  name = 'AddEstudianteCursoFieldsToNotas1778200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notas" ADD "estudianteId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "notas" ADD "cursoId" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notas" DROP COLUMN "cursoId"`);
    await queryRunner.query(`ALTER TABLE "notas" DROP COLUMN "estudianteId"`);
  }
}
