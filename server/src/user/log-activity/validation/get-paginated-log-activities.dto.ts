import { IsOptional, IsPositive, IsString } from 'class-validator';

export default class GetPaginatedLogActivitiesDto {
  @IsPositive()
  page: number;

  @IsPositive()
  perPage: number;

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsString()
  type: string;
}
