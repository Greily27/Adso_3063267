import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Curso } from '../../cursos/entities/curso.entity';

@Entity('materias')
export class Materia {

    @PrimaryGeneratedColumn()
    idMateria: number;

    @Column({
        type: 'varchar',
        length: 100,
    })
    nombreMateria: string;

    @Column({
        type: 'boolean',
        default: true,
    })
    estado: boolean;

    @ManyToMany(() => Curso, curso => curso.materias)
    cursos: Curso[];

}