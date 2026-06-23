import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHorariosTable1779200000000 implements MigrationInterface {
  name = 'CreateHorariosTable1779200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."horarios_dia_enum" AS ENUM('lunes', 'martes', 'miercoles', 'jueves', 'viernes')`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "horarios" ("idHorario" SERIAL NOT NULL, "dia" "public"."horarios_dia_enum" NOT NULL, "horaInicio" character varying(5) NOT NULL, "horaFin" character varying(5) NOT NULL, "asignacionId" integer NOT NULL, CONSTRAINT "PK_horarios" PRIMARY KEY ("idHorario"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_horarios_asignacion" ON "horarios" ("asignacionId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_horarios_dia_horas" ON "horarios" ("dia", "horaInicio", "horaFin")`,
    );
    await queryRunner.query(
      `ALTER TABLE "horarios" ADD CONSTRAINT "FK_horarios_asignacion" FOREIGN KEY ("asignacionId") REFERENCES "asignaciones"("idAsignacion") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "horarios" DROP CONSTRAINT IF EXISTS "FK_horarios_asignacion"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_horarios_dia_horas"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_horarios_asignacion"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "horarios"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."horarios_dia_enum"`);
  }
}
