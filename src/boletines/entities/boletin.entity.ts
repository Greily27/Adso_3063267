import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EstadoBoletin {
  PUBLICADO = 'publicado',
  BORRADOR = 'borrador',
  ANULADO = 'anulado',
}

@Entity('boletines')
export class Boletin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  estudianteId: number;

  @Column({ type: 'integer' })
  periodoId: number;

  @Column({ type: 'integer' })
  cursoId: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  archivoUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  rutaArchivo: string | null;

  @Column({
    type: 'enum',
    enum: EstadoBoletin,
    default: EstadoBoletin.BORRADOR,
  })
  estado: EstadoBoletin;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  promedio: number | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'timestamp', nullable: true })
  fechaGeneracion: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
