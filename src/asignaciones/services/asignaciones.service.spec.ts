import { Test, TestingModule } from '@nestjs/testing';
import { AsignacionesService } from './asignaciones.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Asignacion } from '../entities/asignacione.entity';
import { Curso } from 'src/cursos/entities/curso.entity';

describe('AsignacionesService', () => {
  let service: AsignacionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AsignacionesService,
        {
          provide: getRepositoryToken(Asignacion),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Curso),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AsignacionesService>(AsignacionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
