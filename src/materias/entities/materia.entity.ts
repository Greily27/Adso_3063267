import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToMany,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Curso } from '../../cursos/entities/curso.entity';
import { Nota } from '../../notas/entities/nota.entity';
import { User } from '../../users/entities/user.entity';

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

    @OneToMany(() => Nota, (nota) => nota.materia)
    notas: Nota[];

    @ManyToOne(() => User, (user) => user.materias, { nullable: true })
    @JoinColumn({ name: 'docenteId' })
    docente: User | null;

}
