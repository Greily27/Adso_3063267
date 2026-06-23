import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Curso } from '../entities/curso.entity';
import { CursosService } from './cursos.service';
import { User } from 'src/users/entities/user.entity';
import { Materia } from 'src/materias/entities/materia.entity';
import { AsignacionesService } from 'src/asignaciones/services/asignaciones.service';

describe('CursosService', () => {
  let service: CursosService;
  const mockRepository = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CursosService,
        {
          provide: getRepositoryToken(Curso),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Materia),
          useValue: mockRepository,
        },
        {
          provide: AsignacionesService,
          useValue: {
            createManyForCurso: jest.fn(),
            replaceForCurso: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CursosService>(CursosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
