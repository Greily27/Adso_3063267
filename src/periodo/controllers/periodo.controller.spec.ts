import { Test, TestingModule } from '@nestjs/testing';

import { PeriodoController } from './periodo.controller';
import { PeriodoService } from '../services/periodo.service';

describe('PeriodoController', () => {
  let controller: PeriodoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeriodoController],
      providers: [
        {
          provide: PeriodoService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PeriodoController>(PeriodoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
