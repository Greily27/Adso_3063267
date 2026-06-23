import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Periodo } from '../entities/periodo.entity';
import { PeriodoService } from './periodo.service';

describe('PeriodoService', () => {
  let service: PeriodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeriodoService,
        {
          provide: getRepositoryToken(Periodo),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PeriodoService>(PeriodoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
