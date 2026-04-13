import { Test, TestingModule } from '@nestjs/testing';
import { MateriasController } from '../controllers/materias.controller';
import { MateriasService } from '../services/materias.service';

describe('MateriasController', () => {
  let controller: MateriasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MateriasController],
      providers: [MateriasService],
    }).compile();

    controller = module.get<MateriasController>(MateriasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
