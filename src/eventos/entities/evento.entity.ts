import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum DestinatarioEvento {
  DOCENTE = 'DOCENTE',
  ESTUDIANTE = 'ESTUDIANTE',
  ACUDIENTE = 'ACUDIENTE',
}

export enum EstadoEvento {
  BORRADOR = 'BORRADOR',
  PUBLICADO = 'PUBLICADO',
  CANCELADO = 'CANCELADO',
}

@Entity('eventos')
export class Evento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 180 })
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'varchar', length: 100 })
  categoria: string;

  @Column({ type: 'timestamptz' })
  fechaInicio: Date;

  @Column({ type: 'timestamptz', nullable: true })
  fechaFin: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ubicacion: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imagenUrl: string | null;

  @Column({
    type: 'enum',
    enum: DestinatarioEvento,
    array: true,
    default: [DestinatarioEvento.DOCENTE, DestinatarioEvento.ESTUDIANTE],
  })
  destinatarios: DestinatarioEvento[];

  @Column({
    type: 'enum',
    enum: EstadoEvento,
    default: EstadoEvento.BORRADOR,
  })
  estado: EstadoEvento;

  @Column({ type: 'integer' })
  creadoPorId: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creadoPorId' })
  creadoPor: User;
}
