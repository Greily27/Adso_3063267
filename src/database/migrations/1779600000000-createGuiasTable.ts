import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGuiasTable1779600000000 implements MigrationInterface {
  name = 'CreateGuiasTable1779600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "guias" ("idGuia" SERIAL NOT NULL, "nombreGuia" character varying(255) NOT NULL, "descripcion" text NOT NULL, "archivoUrl" character varying(500) NOT NULL, "estado" boolean NOT NULL DEFAULT true, "asignacionId" integer NOT NULL, CONSTRAINT "PK_guias" PRIMARY KEY ("idGuia"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_guias_asignacion" ON "guias" ("asignacionId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "guias" ADD CONSTRAINT "FK_guias_asignacion" FOREIGN KEY ("asignacionId") REFERENCES "asignaciones"("idAsignacion") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "guias" DROP CONSTRAINT IF EXISTS "FK_guias_asignacion"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_guias_asignacion"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "guias"`);
  }
}
