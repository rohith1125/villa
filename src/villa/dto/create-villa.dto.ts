import {
  IsString,
  IsNumber,
  IsArray,
  IsEnum,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export enum VillaStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export enum CancellationPolicy {
  FLEXIBLE = 'FLEXIBLE',
  MODERATE = 'MODERATE',
  STRICT = 'STRICT',
}

export class CreateVillaDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsNumber()
  pricePerNight: number;

  @IsArray()
  amenities: string[];

  @IsArray()
  images: string[];

  @IsEnum(VillaStatus)
  status: VillaStatus;

  @IsEnum(CancellationPolicy)
  cancellationPolicy: CancellationPolicy;
}
