import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixDocenteMateriaColumnNames1778600000000
  implements MigrationInterface
{
  name = 'FixDocenteMateriaColumnNames1778600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "docente_materia" DROP CONSTRAINT IF EXISTS "FK_docente_materia_docente"`,
    );
    await queryRunner.query(
      `ALTER TABLE "docente_materia" DROP CONSTRAINT IF EXISTS "FK_docente_materia_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "docente_materia" DROP CONSTRAINT IF EXISTS "FK_docente_materia_materia"`,
    );
    await queryRunner.query(
      `ALTER TABLE "docente_materia" DROP CONSTRAINT IF EXISTS "PK_docente_materia"`,
    );
    await queryRunner.query(
      `DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'docente_materia' AND column_name = 'docenteId') AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'docente_materia' AND column_name = 'userId') THEN ALTER TABLE "docente_materia" RENAME COLUMN "docenteId" TO "userId"; END IF; END $$`,
    );
    await queryRunner.query(
      `DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'docente_materia' AND column_name = 'materiaIdMateria') AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'docente_materia' AND column_name = 'materiasIdMateria') THEN ALTER TABLE "docente_materia" RENAME COLUMN "materiaIdMateria" TO "materiasIdMateria"; END IF; END $$`,
    );
    await queryRunner.query(
      `ALTER TABLE "docente_materia" ADD CONSTRAINT "PK_docente_materia" PRIMARY KEY ("userId", "materiasIdMateria")`,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "docente_materia" DROP CONSTRAINT IF EXISTS "FK_docente_materia_materia"`,
    );
    await queryRunner.query(
      `ALTER TABLE "docente_materia" DROP CONSTRAINT IF EXISTS "FK_docente_materia_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "docente_materia" DROP CONSTRAINT IF EXISTS "PK_docente_materia"`,
    );
    await queryRunner.query(
      `ALTER TABLE "docente_materia" RENAME COLUMN "userId" TO "docenteId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "docente_materia" RENAME COLUMN "materiasIdMateria" TO "materiaIdMateria"`,
    );
    await queryRunner.query(
      `ALTER TABLE "docente_materia" ADD CONSTRAINT "PK_docente_materia" PRIMARY KEY ("docenteId", "materiaIdMateria")`,
    );
    await queryRunner.query(
      `ALTER TABLE "docente_materia" ADD CONSTRAINT "FK_docente_materia_docente" FOREIGN KEY ("docenteId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "docente_materia" ADD CONSTRAINT "FK_docente_materia_materia" FOREIGN KEY ("materiaIdMateria") REFERENCES "materias"("idMateria") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
