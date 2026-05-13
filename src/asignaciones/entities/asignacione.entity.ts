import { Curso } from 'src/cursos/entities/curso.entity';
import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,} from 'typeorm';

@Entity('asignaciones')
export class Asignacion {
  @PrimaryGeneratedColumn()
  idAsignacion: number;

  @Column({ type: 'integer' })
  cursoId: number;

  @Column({ type: 'integer' })
  materiaId: number;

  @Column({ type: 'integer' })
  docenteId: number;

  @ManyToOne(() => Curso, (curso) => curso.asignaciones, {
    nullable: false,
  })
  @JoinColumn({ name: 'cursoId' })
  curso: Curso;
}
