import { Curso } from 'src/cursos/entities/curso.entity';
import { Guia } from 'src/guias/entities/guia.entity';
import { Horario } from 'src/horarios/entities/horario.entity';
import { Materia } from 'src/materias/entities/materia.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @ManyToOne(() => Materia, { nullable: false })
  @JoinColumn({ name: 'materiaId' })
  materia: Materia;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'docenteId' })
  docente: User;

  @OneToMany(() => Horario, (horario) => horario.asignacion)
  horarios: Horario[];

  @OneToMany(() => Guia, (guia) => guia.asignacion)
  guias: Guia[];
}
