import { Curso } from 'src/cursos/entities/curso.entity';
import { Estudiante } from 'src/estudiantes/entities/estudiante.entity';
import { Role } from 'src/roles/entities/role.entity';
import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    names;

    @Column({ type: 'varchar', length: 255 })
    lastNames;

    @Column({ type: 'varchar', length: 255 })
    phone;

    @Column({ type: 'varchar', length: 255 })
    address;

    @Column({ type: 'varchar', length: 255 })
    docType;

    @Column({ unique: true })
    document: string;

    @Column({ type: 'varchar', length: 255 })
    photo: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToMany(() => Role, role => role.users)
    @JoinTable({
        name: 'user_roles'
    })
    roles: Role[];

    @ManyToMany(() => Curso, curso => curso.users)
    @JoinTable({
        name: 'user_cursos'
    })
    cursos: Curso[];

    @OneToOne(() => Estudiante, estudiante => estudiante.user)
    estudiante: Estudiante;
}
