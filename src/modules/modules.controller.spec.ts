import { Test, TestingModule } from '@nestjs/testing';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';

describe('ModulesController', () => {
  let controller: ModulesController;

  const modulesServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModulesController],
      providers: [
        {
          provide: ModulesService,
          useValue: modulesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ModulesController>(ModulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
