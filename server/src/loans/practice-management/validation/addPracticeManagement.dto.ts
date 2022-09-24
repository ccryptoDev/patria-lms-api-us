import {
  IsAlpha,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
  Matches,
  MaxDate,
  MaxLength,
  MinDate,
  MinLength,
} from 'class-validator';
import moment from 'moment';

export default class AddPracticeManagementDto {
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'city should only contain letters and spaces',
  })
  city: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  managementRegion: string;

  @MinDate(moment().subtract(100, 'years').startOf('day').toDate())
  @MaxDate(moment().startOf('day').toDate())
  openDate: Date;

  @IsNotEmpty()
  @IsNumberString()
  @MinLength(10)
  @MaxLength(10)
  phone: string;

  @IsNotEmpty()
  @IsString()
  region: string;

  @IsNotEmpty()
  @IsString()
  regionalManager: string;

  @IsNotEmpty()
  @IsAlpha()
  @Length(2, 2)
  stateCode: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(5, 5)
  zip: string;
}
