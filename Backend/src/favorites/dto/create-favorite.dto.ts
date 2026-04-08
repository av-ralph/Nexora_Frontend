import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateFavoriteDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsNumber()
  @IsNotEmpty()
  movie_id: number;

  @IsString()
  @IsOptional()
  movie_title?: string;

  @IsString()
  @IsOptional()
  movie_poster?: string;

  @IsString()
  @IsOptional()
  media_type?: string;
}