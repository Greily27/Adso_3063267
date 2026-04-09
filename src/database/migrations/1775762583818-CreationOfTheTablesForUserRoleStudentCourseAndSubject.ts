import { MigrationInterface, QueryRunner } from "typeorm";

export class CreationOfTheTablesForUserRoleStudentCourseAndSubject1775762583818 implements MigrationInterface {
    name = 'CreationOfTheTablesForUserRoleStudentCourseAndSubject1775762583818'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "estudiante" ("id" SERIAL NOT NULL, "tipoDocTutor" character varying(255) NOT NULL, "documentoTutor" character varying(255) NOT NULL, "emailTutor" character varying(255) NOT NULL, "nombreTutor" character varying(255) NOT NULL, "apellidoTutor" character varying(255) NOT NULL, "ocupacionTutor" character varying(255) NOT NULL, "telefonoTutor" character varying(255) NOT NULL, "promedio" character varying(255) NOT NULL, "userId" integer, "cursoId" integer NOT NULL, CONSTRAINT "REL_4118487d9679172ccb9da29aa5" UNIQUE ("userId"), CONSTRAINT "PK_c7507c4641e36b102952aefc33b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "materias" ("idMateria" SERIAL NOT NULL, "nombreMateria" character varying(100) NOT NULL, "estado" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_455a40b9af2323e78d8a9c2c08c" PRIMARY KEY ("idMateria"))`);
        await queryRunner.query(`CREATE TABLE "curso" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "nombreCurso" character varying(100) NOT NULL, "directorCurso" integer, CONSTRAINT "PK_76073a915621326fb85f28ecc5d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "modules" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_8cd1abde4b70e59644c98668c06" UNIQUE ("name"), CONSTRAINT "PK_7dbefd488bd96c5bf31f0ce0c95" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "description" character varying(255) NOT NULL, CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE ("name"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "names" character varying(255) NOT NULL, "lastNames" character varying(255) NOT NULL, "phone" character varying(255) NOT NULL, "address" character varying(255) NOT NULL, "docType" character varying(255) NOT NULL, "document" character varying NOT NULL, "photo" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_71fdad8489d3d818ec393e6eb14" UNIQUE ("document"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "curso_materia" ("cursoId" integer NOT NULL, "materiasIdMateria" integer NOT NULL, CONSTRAINT "PK_829c11f09fde55fda2d9217a18d" PRIMARY KEY ("cursoId", "materiasIdMateria"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d50fd6cd9ce512b9324d79bdfd" ON "curso_materia" ("cursoId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a01961f0fb31a1be95ee5deb74" ON "curso_materia" ("materiasIdMateria") `);
        await queryRunner.query(`CREATE TABLE "role_modules" ("role_id" integer NOT NULL, "module_id" integer NOT NULL, CONSTRAINT "PK_0898417a9cc2d78e322076dc86a" PRIMARY KEY ("role_id", "module_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d94c957204d1c78e702a97cc1a" ON "role_modules" ("role_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_037d3081ebb1e33fa2b4204e05" ON "role_modules" ("module_id") `);
        await queryRunner.query(`CREATE TABLE "user_roles" ("userId" integer NOT NULL, "roleId" integer NOT NULL, CONSTRAINT "PK_88481b0c4ed9ada47e9fdd67475" PRIMARY KEY ("userId", "roleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_472b25323af01488f1f66a06b6" ON "user_roles" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_86033897c009fcca8b6505d6be" ON "user_roles" ("roleId") `);
        await queryRunner.query(`CREATE TABLE "user_cursos" ("userId" integer NOT NULL, "cursoId" integer NOT NULL, CONSTRAINT "PK_e0bc0397e2a2f3aab47692ab329" PRIMARY KEY ("userId", "cursoId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ad8810756ae9064e55911f05e6" ON "user_cursos" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_cf3df86fe9fe34614ebe8e237e" ON "user_cursos" ("cursoId") `);
        await queryRunner.query(`ALTER TABLE "estudiante" ADD CONSTRAINT "FK_4118487d9679172ccb9da29aa5a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "estudiante" ADD CONSTRAINT "FK_8547f0515b9a315eb0a8a419499" FOREIGN KEY ("cursoId") REFERENCES "curso"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "curso_materia" ADD CONSTRAINT "FK_d50fd6cd9ce512b9324d79bdfd5" FOREIGN KEY ("cursoId") REFERENCES "curso"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "curso_materia" ADD CONSTRAINT "FK_a01961f0fb31a1be95ee5deb748" FOREIGN KEY ("materiasIdMateria") REFERENCES "materias"("idMateria") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_modules" ADD CONSTRAINT "FK_d94c957204d1c78e702a97cc1a9" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_modules" ADD CONSTRAINT "FK_037d3081ebb1e33fa2b4204e057" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_472b25323af01488f1f66a06b67" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_86033897c009fcca8b6505d6be2" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_cursos" ADD CONSTRAINT "FK_ad8810756ae9064e55911f05e65" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_cursos" ADD CONSTRAINT "FK_cf3df86fe9fe34614ebe8e237e8" FOREIGN KEY ("cursoId") REFERENCES "curso"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_cursos" DROP CONSTRAINT "FK_cf3df86fe9fe34614ebe8e237e8"`);
        await queryRunner.query(`ALTER TABLE "user_cursos" DROP CONSTRAINT "FK_ad8810756ae9064e55911f05e65"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_86033897c009fcca8b6505d6be2"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_472b25323af01488f1f66a06b67"`);
        await queryRunner.query(`ALTER TABLE "role_modules" DROP CONSTRAINT "FK_037d3081ebb1e33fa2b4204e057"`);
        await queryRunner.query(`ALTER TABLE "role_modules" DROP CONSTRAINT "FK_d94c957204d1c78e702a97cc1a9"`);
        await queryRunner.query(`ALTER TABLE "curso_materia" DROP CONSTRAINT "FK_a01961f0fb31a1be95ee5deb748"`);
        await queryRunner.query(`ALTER TABLE "curso_materia" DROP CONSTRAINT "FK_d50fd6cd9ce512b9324d79bdfd5"`);
        await queryRunner.query(`ALTER TABLE "estudiante" DROP CONSTRAINT "FK_8547f0515b9a315eb0a8a419499"`);
        await queryRunner.query(`ALTER TABLE "estudiante" DROP CONSTRAINT "FK_4118487d9679172ccb9da29aa5a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cf3df86fe9fe34614ebe8e237e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ad8810756ae9064e55911f05e6"`);
        await queryRunner.query(`DROP TABLE "user_cursos"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_86033897c009fcca8b6505d6be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_472b25323af01488f1f66a06b6"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_037d3081ebb1e33fa2b4204e05"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d94c957204d1c78e702a97cc1a"`);
        await queryRunner.query(`DROP TABLE "role_modules"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a01961f0fb31a1be95ee5deb74"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d50fd6cd9ce512b9324d79bdfd"`);
        await queryRunner.query(`DROP TABLE "curso_materia"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TABLE "modules"`);
        await queryRunner.query(`DROP TABLE "curso"`);
        await queryRunner.query(`DROP TABLE "materias"`);
        await queryRunner.query(`DROP TABLE "estudiante"`);
    }

}
