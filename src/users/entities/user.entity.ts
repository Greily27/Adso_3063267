import { Curso } from 'src/cursos/entities/curso.entity';
import { Estudiante } from 'src/estudiantes/entities/estudiante.entity';
import { Materia } from 'src/materias/entities/materia.entity';
import { ReservaAuditorio } from 'src/auditorios/entities/reserva-auditorio.entity';
import { Role } from 'src/roles/entities/role.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  names;

  @Column({ type: 'varchar', length: 255 })
  lastNames;

  @Column({ type: 'varchar', length: 255 })
  phone;

  @Column({ type: 'varchar', length: 255 })
  address;

  @Column({ type: 'varchar', length: 255 })
  docType;

  @Column({ unique: true })
  document: string;

  @Column({ type: 'varchar', length: 255 })
  photo: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordTokenExpires: Date | null;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
  })
  roles: Role[];

  @ManyToMany(() => Curso, (curso) => curso.docentes)
  cursos: Curso[];

  @ManyToMany(() => Materia, (materia) => materia.docentes)
  @JoinTable({
    name: 'docente_materia',
  })
  materias: Materia[];

  @OneToOne(() => Estudiante, (estudiante) => estudiante.user)
  estudiante: Estudiante;

  @ManyToMany(() => Estudiante, (estudiante) => estudiante.acudientes)
  acudidos: Estudiante[];

  @OneToMany(() => ReservaAuditorio, (reserva) => reserva.usuario)
  reservasAuditorio: ReservaAuditorio[];
}
