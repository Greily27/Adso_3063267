import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ReservaAuditorio } from './reserva-auditorio.entity';

@Entity('auditorio')
export class Auditorio {
  @PrimaryGeneratedColumn()
  idauditorio: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  nombre: string;

  @OneToMany(() => ReservaAuditorio, (reserva) => reserva.auditorio)
  reservas: ReservaAuditorio[];
}
