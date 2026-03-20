import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigrationCreateTableEstudiantesCursosAndEditTableUsers1773860452720 implements MigrationInterface {
    name = 'InitialMigrationCreateTableEstudiantesCursosAndEditTableUsers1773860452720'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`CREATE TABLE "curso" ( "id" SERIAL NOT NULL,"isActive" boolean NOT NULL DEFAULT true,"nombreCurso" character varying(100) NOT NULL,CONSTRAINT "PK_curso_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "estudiante" ("id" SERIAL NOT NULL,"tipoDocTutor" character varying(255) NOT NULL,"documentoTutor" character varying(255) NOT NULL,"emailTutor" character varying(255) NOT NULL,"nombreTutor" character varying(255) NOT NULL,"apellidoTutor" character varying(255) NOT NULL,"ocupacionTutor" character varying(255) NOT NULL,"telefonoTutor" character varying(255) NOT NULL,"promedio" character varying(255) NOT NULL,"userId" integer NOT NULL,CONSTRAINT "REL_estudiante_user" UNIQUE ("userId"),
                CONSTRAINT "PK_estudiante_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_cursos" ("userId" integer NOT NULL,"cursoId" integer NOT NULL,CONSTRAINT "PK_user_cursos" PRIMARY KEY ("userId", "cursoId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_user_cursos_user" ON "user_cursos" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_user_cursos_curso" ON "user_cursos" ("cursoId")`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "name" TO "names"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "lastName" TO "lastNames"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "docNumber" TO "document"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "phone" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "address" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "photo" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_user_document" UNIQUE ("document")`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "UQ_e12875dfb3b1d92d7d7c5377e22"`);        await queryRunner.query(`ALTER TABLE "estudiante" ADD CONSTRAINT "FK_estudiante_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_cursos" ADD CONSTRAINT "FK_user_cursos_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_cursos" ADD CONSTRAINT "FK_user_cursos_curso" FOREIGN KEY ("cursoId") REFERENCES "curso"("id")ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE "user_cursos" DROP CONSTRAINT "FK_user_cursos_curso"`);
        await queryRunner.query(`ALTER TABLE "user_cursos" DROP CONSTRAINT "FK_user_cursos_user"`);
        await queryRunner.query(`ALTER TABLE "estudiante" DROP CONSTRAINT "FK_estudiante_user"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_user_email" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_user_document"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "photo"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "document" TO "docNumber"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "lastNames" TO "lastName"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "names" TO "name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_cursos_curso"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_cursos_user"`);
        await queryRunner.query(`DROP TABLE "user_cursos"`);
        await queryRunner.query(`DROP TABLE "estudiante"`);
        await queryRunner.query(`DROP TABLE "curso"`);
    }
}