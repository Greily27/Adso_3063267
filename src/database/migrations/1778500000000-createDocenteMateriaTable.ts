import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocenteMateriaTable1778500000000
  implements MigrationInterface
{
  name = 'CreateDocenteMateriaTable1778500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "docente_materia" ("userId" integer NOT NULL, "materiasIdMateria" integer NOT NULL, CONSTRAINT "PK_docente_materia" PRIMARY KEY ("userId", "materiasIdMateria"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_docente_materia_user" ON "docente_materia" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_docente_materia_materia" ON "docente_materia" ("materiasIdMateria")`,
    );
    await queryRunner.query(
      `ALTER TABLE "docente_materia" ADD CONSTRAINT "FK_docente_materia_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "docente_materia" ADD CONSTRAINT "FK_docente_materia_materia" FOREIGN KEY ("materiasIdMateria") REFERENCES "materias"("idMateria") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `INSERT INTO "docente_materia" ("userId", "materiasIdMateria") SELECT "docenteId", "idMateria" FROM "materias" WHERE "docenteId" IS NOT NULL ON CONFLICT DO NOTHING`,
    );
    await queryRunner.query(
      `ALTER TABLE "materias" DROP CONSTRAINT IF EXISTS "FK_materias_docente"`,
    );
    await queryRunner.query(
      `ALTER TABLE "materias" DROP COLUMN IF EXISTS "docenteId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "materias" ADD "docenteId" integer`);
    await queryRunner.query(
      `UPDATE "materias" SET "docenteId" = sub."userId" FROM (SELECT DISTINCT ON ("materiasIdMateria") "materiasIdMateria", "userId" FROM "docente_materia" ORDER BY "materiasIdMateria", "userId") sub WHERE "materias"."idMateria" = sub."materiasIdMateria"`,
    );
    await queryRunner.query(
      `ALTER TABLE "materias" ADD CONSTRAINT "FK_materias_docente" FOREIGN KEY ("docenteId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "docente_materia" DROP CONSTRAINT IF EXISTS "FK_docente_materia_materia"`,
    );
    await queryRunner.query(
      `ALTER TABLE "docente_materia" DROP CONSTRAINT IF EXISTS "FK_docente_materia_user"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_docente_materia_materia"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_docente_materia_user"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "docente_materia"`);
  }
}
