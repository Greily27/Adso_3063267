import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFechaHoraFinToReservaAuditorio1779500000000 implements MigrationInterface {
  name = 'AddFechaHoraFinToReservaAuditorio1779500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reserva_auditorio" ADD COLUMN "fecha_hora_fin" TIMESTAMP`,
    );
    await queryRunner.query(
      `UPDATE "reserva_auditorio" SET "fecha_hora_fin" = "fecha_hora" + INTERVAL '1 hour' WHERE "fecha_hora_fin" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "reserva_auditorio" ALTER COLUMN "fecha_hora_fin" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_reserva_auditorio_rango" ON "reserva_auditorio" ("fecha_hora", "fecha_hora_fin")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_reserva_auditorio_rango"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reserva_auditorio" DROP COLUMN IF EXISTS "fecha_hora_fin"`,
    );
  }
}
