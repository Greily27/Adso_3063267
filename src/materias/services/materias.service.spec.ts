import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Curso } from '../../cursos/entities/curso.entity';
import { User } from '../../users/entities/user.entity';
import { Materia } from '../entities/materia.entity';
import { MateriasService } from './materias.service';

describe('MateriasService', () => {
  let service: MateriasService;

  const repositoryMock = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MateriasService,
        {
          provide: getRepositoryToken(Materia),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(Curso),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(User),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<MateriasService>(MateriasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
