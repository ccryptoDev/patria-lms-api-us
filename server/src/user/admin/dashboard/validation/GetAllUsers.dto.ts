import { IsOptional, IsPositive, IsString } from 'class-validator';

export default class GetAllUsersDto {
  @IsPositive()
  page: number;

  @IsPositive()
  perPage: number;

  @IsOptional()
  @IsString()
  search: string;
}
