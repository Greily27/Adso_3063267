import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateObservadoresTable1778300000000
  implements MigrationInterface
{
  name = 'CreateObservadoresTable1778300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "observadores" ("idObservador" SERIAL NOT NULL, "estudianteId" integer NOT NULL, "cursoId" integer NOT NULL, "docenteId" integer NOT NULL, "fecha" date NOT NULL, "categoria" character varying(100) NOT NULL, "descripcion" text NOT NULL, CONSTRAINT "PK_observadores_idObservador" PRIMARY KEY ("idObservador"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "observadores"`);
  }
}
