import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDirectorCursoForeignKey1777900000000 implements MigrationInterface {
  name = 'AddDirectorCursoForeignKey1777900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_curso_directorCurso" ON "curso" ("directorCurso") `,
    );
    await queryRunner.query(
      `ALTER TABLE "curso" ADD CONSTRAINT "FK_curso_directorCurso_user" FOREIGN KEY ("directorCurso") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "curso" DROP CONSTRAINT "FK_curso_directorCurso_user"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_curso_directorCurso"`);
  }
}
