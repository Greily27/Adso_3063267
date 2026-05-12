import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ModuleEntity } from './entities/module.entity';
import { ModulesService } from './modules.service';

describe('ModulesService', () => {
  let service: ModulesService;

  const repositoryMock = {
    create: jest.fn(),
    find: jest.fn(),
    findBy: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModulesService,
        {
          provide: getRepositoryToken(ModuleEntity),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<ModulesService>(ModulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
