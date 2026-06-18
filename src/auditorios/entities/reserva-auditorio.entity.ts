import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Auditorio } from './auditorio.entity';

@Entity('reserva_auditorio')
export class ReservaAuditorio {
  @PrimaryGeneratedColumn()
  idreserva: number;

  @Column({ type: 'integer' })
  idusuario: number;

  @Column({ type: 'integer' })
  idauditorio: number;

  @Column({ type: 'timestamp' })
  fecha_hora: Date;

  @Column({ type: 'timestamp' })
  fecha_hora_fin: Date;

  @Column({ type: 'integer', nullable: true })
  idasignacion: number | null;

  @ManyToOne(() => User, (usuario) => usuario.reservasAuditorio, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idusuario' })
  usuario: User;

  @ManyToOne(() => Auditorio, (auditorio) => auditorio.reservas, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idauditorio' })
  auditorio: Auditorio;
}
