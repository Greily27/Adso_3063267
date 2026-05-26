import { Materia } from '../../materias/entities/materia.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity('notas')
export class Nota {
  @PrimaryGeneratedColumn()
  idNota: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 1,
  })
  valor: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  descripcion: string;

  @Column({ type: 'integer', nullable: true })
  estudianteId: number | null;

  @Column({ type: 'integer', nullable: true })
  cursoId: number | null;

  @ManyToOne(() => Materia, (materia) => materia.notas, {
    nullable: false,
  })
  materia: Materia;

  @Column({ type: 'integer', nullable: true })
  periodo: number | null;
}
