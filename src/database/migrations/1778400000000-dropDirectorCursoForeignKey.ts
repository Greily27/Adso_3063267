import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropDirectorCursoForeignKey1778400000000
  implements MigrationInterface
{
  name = 'DropDirectorCursoForeignKey1778400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "curso" DROP CONSTRAINT IF EXISTS "FK_curso_directorCurso_user"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_curso_directorCurso"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_curso_directorCurso" ON "curso" ("directorCurso")`,
    );
    await queryRunner.query(
      `ALTER TABLE "curso" ADD CONSTRAINT "FK_curso_directorCurso_user" FOREIGN KEY ("directorCurso") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
