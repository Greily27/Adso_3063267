import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('periodo')
export class Periodo {
  @PrimaryGeneratedColumn()
  idPeriodo: number;

  @Column({ type: 'date' })
  fechaInicial: Date;

  @Column({ type: 'date' })
  fechaFinal: Date;

  @Column({ type: 'varchar', length: 100 })
  nombrePeriodo: string;
}
