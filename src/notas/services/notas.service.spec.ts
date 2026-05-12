import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Materia } from '../../materias/entities/materia.entity';
import { Nota } from '../entities/nota.entity';
import { NotasService } from './notas.service';

describe('NotasService', () => {
  let service: NotasService;

  const repositoryMock = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotasService,
        {
          provide: getRepositoryToken(Nota),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(Materia),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<NotasService>(NotasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
