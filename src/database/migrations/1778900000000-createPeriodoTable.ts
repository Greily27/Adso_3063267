import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePeriodoTable1778900000000 implements MigrationInterface {
  name = 'CreatePeriodoTable1778900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "periodo" ("idPeriodo" SERIAL NOT NULL, "fechaInicial" date NOT NULL, "fechaFinal" date NOT NULL, "nombrePeriodo" character varying(100) NOT NULL, CONSTRAINT "UQ_periodo_nombrePeriodo" UNIQUE ("nombrePeriodo"), CONSTRAINT "PK_periodo_idPeriodo" PRIMARY KEY ("idPeriodo"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "periodo"`);
  }
}
