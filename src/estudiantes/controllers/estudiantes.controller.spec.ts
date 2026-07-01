import { Test, TestingModule } from '@nestjs/testing';
import { EstudiantesController } from '../controllers/estudiantes.controller';
import { EstudiantesService } from '../services/estudiantes.service';

describe('EstudiantesController', () => {
  let controller: EstudiantesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstudiantesController],
      providers: [EstudiantesService],
    }).compile();

    controller = module.get<EstudiantesController>(EstudiantesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
