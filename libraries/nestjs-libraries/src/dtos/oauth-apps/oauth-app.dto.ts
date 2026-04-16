import { IsDefined, IsOptional, IsString, MinLength } from 'class-validator';

export class OAuthAppUpsertDto {
  @IsDefined()
  @IsString()
  @MinLength(1)
  clientId: string;

  @IsDefined()
  @IsString()
  @MinLength(1)
  clientSecret: string;

  @IsOptional()
  @IsString()
  additionalConfig?: string;
}
