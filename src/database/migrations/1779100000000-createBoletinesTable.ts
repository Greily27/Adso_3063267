import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBoletinesTable1779100000000
  implements MigrationInterface
{
  name = 'CreateBoletinesTable1779100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."boletines_estado_enum" AS ENUM('publicado', 'borrador', 'anulado')`,
    );
    await queryRunner.query(
      `CREATE TABLE "boletines" ("id" SERIAL NOT NULL, "estudianteId" integer NOT NULL, "periodoId" integer NOT NULL, "cursoId" integer NOT NULL, "archivoUrl" character varying(500), "rutaArchivo" character varying(500), "estado" "public"."boletines_estado_enum" NOT NULL DEFAULT 'borrador', "promedio" numeric(5,2), "metadata" jsonb, "fechaGeneracion" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_boletines_id" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "boletines"`);
    await queryRunner.query(`DROP TYPE "public"."boletines_estado_enum"`);
  }
}
