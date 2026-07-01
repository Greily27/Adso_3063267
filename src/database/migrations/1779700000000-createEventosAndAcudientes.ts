import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventosAndAcudientes1779700000000 implements MigrationInterface {
  name = 'CreateEventosAndAcudientes1779700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."eventos_destinatarios_enum" AS ENUM('DOCENTE', 'ESTUDIANTE', 'ACUDIENTE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."eventos_estado_enum" AS ENUM('BORRADOR', 'PUBLICADO', 'CANCELADO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "eventos" ("id" SERIAL NOT NULL, "titulo" character varying(180) NOT NULL, "descripcion" text NOT NULL, "categoria" character varying(100) NOT NULL, "fechaInicio" TIMESTAMP WITH TIME ZONE NOT NULL, "fechaFin" TIMESTAMP WITH TIME ZONE, "ubicacion" character varying(255), "imagenUrl" character varying(500), "destinatarios" "public"."eventos_destinatarios_enum" array NOT NULL DEFAULT '{DOCENTE,ESTUDIANTE}', "estado" "public"."eventos_estado_enum" NOT NULL DEFAULT 'BORRADOR', "creadoPorId" integer NOT NULL, CONSTRAINT "PK_eventos" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "acudiente_estudiantes" ("estudiante_id" integer NOT NULL, "acudiente_id" integer NOT NULL, CONSTRAINT "PK_acudiente_estudiantes" PRIMARY KEY ("estudiante_id", "acudiente_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_acudiente_estudiante" ON "acudiente_estudiantes" ("estudiante_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_acudiente_usuario" ON "acudiente_estudiantes" ("acudiente_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "eventos" ADD CONSTRAINT "FK_eventos_creador" FOREIGN KEY ("creadoPorId") REFERENCES "user"("id") ON DELETE RESTRICT`,
    );
    await queryRunner.query(
      `ALTER TABLE "acudiente_estudiantes" ADD CONSTRAINT "FK_acudiente_estudiante" FOREIGN KEY ("estudiante_id") REFERENCES "estudiante"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "acudiente_estudiantes" ADD CONSTRAINT "FK_acudiente_usuario" FOREIGN KEY ("acudiente_id") REFERENCES "user"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `INSERT INTO "modules" ("name", "description") VALUES ('EVENTOS', 'Consulta y gestión de eventos institucionales') ON CONFLICT ("name") DO NOTHING`,
    );
    await queryRunner.query(
      `INSERT INTO "modules" ("name", "description") SELECT v.name, v.description FROM (VALUES ('estudiantes', 'Consulta de estudiantes asociados'), ('observadores', 'Consulta de observaciones'), ('horarios', 'Consulta de horarios'), ('boletines', 'Consulta de boletines')) AS v(name, description) WHERE NOT EXISTS (SELECT 1 FROM "modules" m WHERE LOWER(m.name) = LOWER(v.name))`,
    );
    await queryRunner.query(
      `INSERT INTO "role" ("name", "description") VALUES ('ACUDIENTE', 'Acudiente de uno o más estudiantes') ON CONFLICT ("name") DO NOTHING`,
    );
    await queryRunner.query(
      `INSERT INTO "role_modules" ("role_id", "module_id") SELECT r.id, m.id FROM "role" r CROSS JOIN "modules" m WHERE m.name = 'EVENTOS' AND UPPER(r.name) IN ('ADMIN', 'ADMINISTRADOR', 'AUXILIAR ADMINISTRATIVO', 'AUXILIAR_ADMINISTRATIVO', 'DOCENTE', 'ESTUDIANTE', 'ACUDIENTE') ON CONFLICT DO NOTHING`,
    );
    await queryRunner.query(
      `INSERT INTO "role_modules" ("role_id", "module_id") SELECT r.id, m.id FROM "role" r CROSS JOIN "modules" m WHERE UPPER(r.name) = 'ACUDIENTE' AND LOWER(m.name) IN ('estudiantes', 'observadores', 'horarios', 'boletines') ON CONFLICT DO NOTHING`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "acudiente_estudiantes" DROP CONSTRAINT "FK_acudiente_usuario"`,
    );
    await queryRunner.query(
      `ALTER TABLE "acudiente_estudiantes" DROP CONSTRAINT "FK_acudiente_estudiante"`,
    );
    await queryRunner.query(`DROP TABLE "acudiente_estudiantes"`);
    await queryRunner.query(
      `ALTER TABLE "eventos" DROP CONSTRAINT "FK_eventos_creador"`,
    );
    await queryRunner.query(`DROP TABLE "eventos"`);
    await queryRunner.query(`DROP TYPE "public"."eventos_estado_enum"`);
    await queryRunner.query(`DROP TYPE "public"."eventos_destinatarios_enum"`);
  }
}
