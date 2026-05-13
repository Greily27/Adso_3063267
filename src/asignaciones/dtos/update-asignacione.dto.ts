import { PartialType } from '@nestjs/swagger';
import { CreateAsignacioneDto } from './create-asignacione.dto';

export class UpdateAsignacioneDto extends PartialType(CreateAsignacioneDto) {}
