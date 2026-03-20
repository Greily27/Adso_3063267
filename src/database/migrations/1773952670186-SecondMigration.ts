import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCursoToEstudianteFix1773955000000 implements MigrationInterface {
    name = 'AddCursoToEstudianteFix1773955000000'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE "estudiante"ADD "cursoId" integer`);
        await queryRunner.query(`UPDATE "estudiante"SET "cursoId" = (SELECT id FROM "curso" LIMIT 1)WHERE "cursoId" IS NULL`);
        await queryRunner.query(`ALTER TABLE "estudiante"ALTER COLUMN "cursoId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "estudiante"ADD CONSTRAINT "FK_estudiante_curso"FOREIGN KEY ("cursoId") REFERENCES "curso"("id")ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE "estudiante"DROP CONSTRAINT "FK_estudiante_curso"`);
        await queryRunner.query(`ALTER TABLE "estudiante"DROP COLUMN "cursoId"`);
    }
}