import { IsOptional, IsPositive, IsString } from 'class-validator';

export default class GetAllCommentsByScreenTrackingDto {
  @IsPositive()
  page: number;

  @IsPositive()
  perPage: number;

  @IsOptional()
  @IsString()
  search: string;
}
