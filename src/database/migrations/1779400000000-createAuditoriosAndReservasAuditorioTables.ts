import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditoriosAndReservasAuditorioTables1779400000000 implements MigrationInterface {
  name = 'CreateAuditoriosAndReservasAuditorioTables1779400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "auditorio" ("idauditorio" SERIAL NOT NULL, "nombre" character varying(255) NOT NULL, CONSTRAINT "UQ_auditorio_nombre" UNIQUE ("nombre"), CONSTRAINT "PK_auditorio" PRIMARY KEY ("idauditorio"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "reserva_auditorio" ("idreserva" SERIAL NOT NULL, "idusuario" integer NOT NULL, "idauditorio" integer NOT NULL, "fecha_hora" TIMESTAMP NOT NULL, "idasignacion" integer, CONSTRAINT "PK_reserva_auditorio" PRIMARY KEY ("idreserva"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_reserva_auditorio_usuario" ON "reserva_auditorio" ("idusuario")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_reserva_auditorio_auditorio" ON "reserva_auditorio" ("idauditorio")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_reserva_auditorio_asignacion" ON "reserva_auditorio" ("idasignacion")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_reserva_auditorio_auditorio_fecha" ON "reserva_auditorio" ("idauditorio", "fecha_hora")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_reserva_auditorio_usuario_fecha" ON "reserva_auditorio" ("idusuario", "fecha_hora")`,
    );
    await queryRunner.query(
      `ALTER TABLE "reserva_auditorio" ADD CONSTRAINT "FK_reserva_auditorio_usuario" FOREIGN KEY ("idusuario") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "reserva_auditorio" ADD CONSTRAINT "FK_reserva_auditorio_auditorio" FOREIGN KEY ("idauditorio") REFERENCES "auditorio"("idauditorio") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reserva_auditorio" DROP CONSTRAINT IF EXISTS "FK_reserva_auditorio_auditorio"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reserva_auditorio" DROP CONSTRAINT IF EXISTS "FK_reserva_auditorio_usuario"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."UQ_reserva_auditorio_usuario_fecha"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."UQ_reserva_auditorio_auditorio_fecha"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_reserva_auditorio_asignacion"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_reserva_auditorio_auditorio"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_reserva_auditorio_usuario"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "reserva_auditorio"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auditorio"`);
  }
}
