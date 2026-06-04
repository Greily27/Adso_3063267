import { Asignacion } from 'src/asignaciones/entities/asignacione.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum DiaHorario {
  Lunes = 'lunes',
  Martes = 'martes',
  Miercoles = 'miercoles',
  Jueves = 'jueves',
  Viernes = 'viernes',
}

@Entity('horarios')
export class Horario {
  @PrimaryGeneratedColumn()
  idHorario: number;

  @Column({
    type: 'enum',
    enum: DiaHorario,
  })
  dia: DiaHorario;

  @Column({ type: 'varchar', length: 5 })
  horaInicio: string;

  @Column({ type: 'varchar', length: 5 })
  horaFin: string;

  @Column({ type: 'integer' })
  asignacionId: number;

  @ManyToOne(() => Asignacion, (asignacion) => asignacion.horarios, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'asignacionId' })
  asignacion: Asignacion;
}
