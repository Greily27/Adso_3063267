import { Estudiante } from 'src/estudiantes/entities/estudiante.entity';
import { Materia } from '../../materias/entities/materia.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Curso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 100 })
  nombreCurso: string;

  @ManyToMany(() => User, (user) => user.cursos)
  @JoinTable({
    name: 'user_cursos',
  })
  docentes: User[];

  @OneToMany(() => Estudiante, (estudiante) => estudiante.curso)
  estudiantes: Estudiante[];

  @Column({ type: 'integer', nullable: true })
  directorCurso: number;

  @ManyToMany(() => Materia, (materia) => materia.cursos)
  @JoinTable({
    name: 'curso_materia',
  })
  materias: Materia[];
}
