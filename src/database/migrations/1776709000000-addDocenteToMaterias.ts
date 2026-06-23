import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDocenteToMaterias1776709000000 implements MigrationInterface {
    name = 'AddDocenteToMaterias1776709000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "materias" ADD "docenteId" integer`);
        await queryRunner.query(`ALTER TABLE "materias" ADD CONSTRAINT "FK_materias_docente" FOREIGN KEY ("docenteId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "materias" DROP CONSTRAINT "FK_materias_docente"`);
        await queryRunner.query(`ALTER TABLE "materias" DROP COLUMN "docenteId"`);
    }
}
