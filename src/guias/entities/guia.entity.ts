import { Asignacion } from 'src/asignaciones/entities/asignacione.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('guias')
export class Guia {
  @PrimaryGeneratedColumn()
  idGuia: number;

  @Column({ type: 'varchar', length: 255 })
  nombreGuia: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'varchar', length: 500 })
  archivoUrl: string;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @Column({ type: 'integer' })
  asignacionId: number;

  @ManyToOne(() => Asignacion, (asignacion) => asignacion.guias, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'asignacionId' })
  asignacion: Asignacion;
}
