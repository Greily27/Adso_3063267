import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('observadores')
export class Observador {
  @PrimaryGeneratedColumn()
  idObservador: number;

  @Column({ type: 'integer' })
  estudianteId: number;

  @Column({ type: 'integer' })
  cursoId: number;

  @Column({ type: 'integer' })
  docenteId: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'varchar', length: 100 })
  categoria: string;

  @Column({ type: 'text' })
  descripcion: string;
}
