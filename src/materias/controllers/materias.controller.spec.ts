import { Test, TestingModule } from '@nestjs/testing';
import { MateriasController } from '../controllers/materias.controller';
import { MateriasService } from '../services/materias.service';

describe('MateriasController', () => {
  let controller: MateriasController;

  const materiasServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MateriasController],
      providers: [
        {
          provide: MateriasService,
          useValue: materiasServiceMock,
        },
      ],
    }).compile();

    controller = module.get<MateriasController>(MateriasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
