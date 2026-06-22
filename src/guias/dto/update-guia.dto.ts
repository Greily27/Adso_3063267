import { PartialType } from '@nestjs/swagger';
import { CreateGuiaDto } from './create-guia.dto';

export class UpdateGuiaDto extends PartialType(CreateGuiaDto) {}
