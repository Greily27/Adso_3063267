import { Curso } from 'src/cursos/entities/curso.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Estudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  tipoDocTutor: string;

  @Column({ type: 'varchar', length: 255 })
  documentoTutor: string;

  @Column({ type: 'varchar', length: 255 })
  emailTutor: string;

  @Column({ type: 'varchar', length: 255 })
  nombreTutor: string;

  @Column({ type: 'varchar', length: 255 })
  apellidoTutor: string;

  @Column({ type: 'varchar', length: 255 })
  ocupacionTutor: string;

  @Column({ type: 'varchar', length: 255 })
  telefonoTutor: string;

  @OneToOne(() => User, (user) => user.estudiante)
  @JoinColumn()
  user: User;

  @ManyToMany(() => User, (user) => user.acudidos)
  @JoinTable({
    name: 'acudiente_estudiantes',
    joinColumn: { name: 'estudiante_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'acudiente_id', referencedColumnName: 'id' },
  })
  acudientes: User[];

  @ManyToOne(() => Curso, (curso) => curso.estudiantes, {
    nullable: false,
  })
  curso: Curso;
}
