import { IsMongoId, IsNotEmpty } from 'class-validator';

export class GetLinkDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}
