import { IsBase64, IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';

enum documentTypeEnum {
  DRIVERS_LICENSE = 'drivers license',
  PASSPORT = 'passport',
  PAYSTUB = 'paystub',
  PROOF_OF_RESIDENCE = 'proofOfResidence',
  OTHER_DOC = 'otherDoc',
}

export default class UploadDocDto {
  // Extracted from JWT
  userId: string;

  @IsNotEmpty()
  @IsEnum(documentTypeEnum, {
    message: "'documentType' should be either 'drivers license' or 'passport'",
  })
  documentType:
    | 'drivers license'
    | 'passport'
    | 'paystub'
    | 'proofOfResidence'
    | 'otherDoc';

  @ValidateIf((o) => o.documentType === 'drivers license')
  @IsNotEmpty()
  @IsBase64()
  driversLicenseFront: string;

  @ValidateIf((o) => o.documentType === 'drivers license')
  @IsNotEmpty()
  @IsBase64()
  driversLicenseBack: string;

  @ValidateIf((o) => o.documentType === 'passport')
  @IsNotEmpty()
  @IsBase64()
  passport: string;

  @ValidateIf((o) => o.documentType === 'proofOfResidence')
  @IsNotEmpty()
  @IsBase64()
  proofOfResidence: string;

  @ValidateIf((o) => o.documentType === 'paystub')
  @IsNotEmpty()
  @IsBase64()
  paystub: string;

  @ValidateIf((o) => o.documentType === 'otherDoc')
  @IsNotEmpty()
  @IsBase64()
  otherDoc: string;

  @ValidateIf((o) => o.documentType === 'otherDoc')
  @IsNotEmpty()
  otherDocTitle: string;
}
