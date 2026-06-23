import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAsignacionesTable1778700000000
  implements MigrationInterface
{
  name = 'CreateAsignacionesTable1778700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "asignaciones" ("idAsignacion" SERIAL NOT NULL, "cursoId" integer NOT NULL, "materiaId" integer NOT NULL, "docenteId" integer NOT NULL, CONSTRAINT "PK_asignaciones" PRIMARY KEY ("idAsignacion"), CONSTRAINT "UQ_asignaciones_curso_materia_docente" UNIQUE ("cursoId", "materiaId", "docenteId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_asignaciones_curso" ON "asignaciones" ("cursoId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_asignaciones_materia" ON "asignaciones" ("materiaId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_asignaciones_docente" ON "asignaciones" ("docenteId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "asignaciones" ADD CONSTRAINT "FK_asignaciones_curso" FOREIGN KEY ("cursoId") REFERENCES "curso"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "asignaciones" DROP CONSTRAINT IF EXISTS "FK_asignaciones_curso"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_asignaciones_docente"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_asignaciones_materia"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_asignaciones_curso"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "asignaciones"`);
  }
}
