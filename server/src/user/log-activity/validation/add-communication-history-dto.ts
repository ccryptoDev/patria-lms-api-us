import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddCommunicationHistoryDto {
  @IsNotEmpty()
  @IsString()
  method: string;

  @IsNotEmpty()
  @IsString()
  summary: string;

  email?: string | null;

  cellPhone?: number | null;

  @IsDateString()
  date: Date;
}
