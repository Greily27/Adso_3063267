import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from 'src/users/dtos/user.dto';
import { RolesService } from 'src/roles/services/roles.service';
import { Curso } from 'src/cursos/entities/curso.entity';
import { Materia } from 'src/materias/entities/materia.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,

        @InjectRepository(Materia)
        private materiaRepo: Repository<Materia>,

        // @InjectRepository(Curso)
        // private cursoRepo: Repository<Curso>, // 🔥 necesario

        private rolesService: RolesService,
    ) {}

    // =========================
    // LISTAR
    // =========================
    async findAll() {
        return await this.userRepo.find({
            relations: ['roles', 'cursos', 'materias'],
        });
    }

    // =========================
    // BUSCAR POR EMAIL
    // =========================
    async findByEmail(email: string) {
        const user = await this.userRepo.findOne({
            where: { email },
            relations: {
                roles: {
                    modules: true,
                },
                cursos: true,
                materias: true,
            },
        });

        if (!user) {
            throw new NotFoundException(`User ${email} not found`);
        }

        return user;
    }

    // =========================
    // BUSCAR UNO
    // =========================
    async findOne(userId: number) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['roles', 'cursos', 'materias'],
        });

        if (!user) {
            throw new NotFoundException(`User #${userId} not found`);
        }

        return user;
    }

    // =========================
    // CREAR USUARIO
    // =========================
    async create(createUserDto: CreateUserDto) {
        const { roleIds, materiaIds, password, ...userData } = createUserDto;

        const hashedPassword = await bcrypt.hash(password, 10);

        const roles = await this.rolesService.findByIds(roleIds);

        if (roles.length !== roleIds.length) {
            throw new NotFoundException('Some roles were not found');
        }

        const newUser = this.userRepo.create({
            ...userData,
            password: hashedPassword,
            roles,
        });

        const savedUser = await this.userRepo.save(newUser);

        if (materiaIds) {
            await this.asignarMateriasADocente(savedUser, materiaIds);
        }

        return await this.findOne(savedUser.id);
    }

    // =========================
    // ACTUALIZAR USUARIO
    // =========================
    async updateUser(id: number, updateUserDto: UpdateUserDto) {
        const { roleIds, materiaIds, password, ...userData } = updateUserDto;

        const user = await this.userRepo.findOne({
            where: { id },
            relations: ['roles', 'materias'],
        });

        if (!user) throw new NotFoundException('User not found');

        // roles
        if (roleIds) {
            const roles = await this.rolesService.findByIds(roleIds);

            if (roles.length !== roleIds.length) {
                throw new NotFoundException('Some roles were not found');
            }

            user.roles = roles;
        }

        // password
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        this.userRepo.merge(user, userData);

        const savedUser = await this.userRepo.save(user);

        if (materiaIds) {
            await this.asignarMateriasADocente(savedUser, materiaIds);
        }

        return await this.findOne(savedUser.id);
    }

    private async asignarMateriasADocente(user: User, materiaIds: number[]) {
        const esDocente = user.roles?.some(
            (role) => role.name?.toUpperCase() === 'DOCENTE',
        );

        if (!esDocente) {
            throw new BadRequestException(
                'Solo se pueden asignar materias a usuarios con rol DOCENTE',
            );
        }

        const materias = await this.materiaRepo.find({
            where: { idMateria: In(materiaIds) },
        });

        if (materias.length !== materiaIds.length) {
            throw new NotFoundException('Una o varias materias no existen');
        }

        user.materias = materias;
        await this.userRepo.save(user);
    }

    // // =========================
    // // ASIGNAR CURSO 🔥🔥🔥
    // // =========================
    // async asignarCurso(userId: number, cursoId: number) {

    //     const user = await this.userRepo.findOne({
    //         where: { id: userId },
    //         relations: ['roles', 'cursos'],
    //     });

    //     if (!user) {
    //         throw new NotFoundException('Usuario no encontrado');
    //     }

    //     const curso = await this.cursoRepo.findOne({
    //         where: { id: cursoId, isActive: true },
    //     });

    //     if (!curso) {
    //         throw new NotFoundException('Curso no encontrado o inactivo');
    //     }

    //     const esEstudiante = user.roles.some(r => r.name === 'ESTUDIANTE');
    //     const esDocente = user.roles.some(r => r.name === 'DOCENTE');

    //     //ESTUDIANTE → SOLO 1 CURSO
    //     if (esEstudiante) {

    //         if (user.cursos && user.cursos.length > 0) {
    //             throw new BadRequestException(
    //                 'El estudiante ya tiene un curso asignado'
    //             );
    //         }

    //         user.cursos = [curso];
    //     }

    //     //El docente va a tener varios cursos
    //     else if (esDocente) {

    //         const yaExiste = user.cursos?.some(c => c.id === cursoId);

    //         if (yaExiste) {
    //             throw new BadRequestException(
    //                 'El docente ya tiene este curso asignado'
    //             );
    //         }

    //         user.cursos = [...(user.cursos || []), curso];
    //     }

    //     else {
    //         throw new BadRequestException('El usuario no tiene rol válido');
    //     }

    //     return await this.userRepo.save(user);
    // }

    // ELIMINAR
    async deleteUser(idUser: number) {
        const user = await this.findOne(idUser);
        return await this.userRepo.remove(user);
    }
}
