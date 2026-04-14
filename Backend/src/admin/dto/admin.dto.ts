import { IsBoolean, IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: string;

  @IsOptional()
  @IsString()
  profileUrl?: string;

  @IsOptional()
  @IsString()
  authId?: string;
}

export class AdminLoginDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}

export class ReviewActionDto {
  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsString()
  content?: string;
}

export class MediaContentDto {
  @IsNumber()
  tmdbId: number;

  @IsString()
  title: string;

  @IsString()
  overview: string;

  @IsString()
  posterPath: string;

  @IsString()
  backdropPath: string;

  @IsEnum(['movie', 'tv'])
  mediaType: 'movie' | 'tv';

  @IsOptional()
  @IsNumber()
  releaseYear?: number;

  @IsOptional()
  @IsNumber()
  rating?: number;
}
