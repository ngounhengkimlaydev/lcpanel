import { IsNotEmpty } from 'class-validator';

export class DeleteModuleDto {
  @IsNotEmpty()
  ids!: number[];
}
