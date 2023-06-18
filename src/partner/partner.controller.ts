import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UsePipes,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PartnerService } from './partner.service';
import { JoiValidationPipe } from './partnerValidation.pipe';
import { registerPartnerValidator } from '../partner/parter.validation';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
@Controller('partner')
export class PartnerController {
  constructor(private readonly partner: PartnerService) {}

  @Get('/getPartnerProfile')
  async getPartnerProfile() {
    return this.partner.getPartnerProfile();
  }

  @Post('/registerPartner')
  @UsePipes(new JoiValidationPipe(registerPartnerValidator))
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'adharcard', maxCount: 1 },
      { name: 'pancard', maxCount: 1 },
    ]),
  )
  async registerPartner(
    @UploadedFiles()
    files: {
      adharcard?: Express.Multer.File[];
      pancard?: Express.Multer.File[];
    },
    @Body() data,
    @Res() res,
  ) {
    console.log(files);
    console.log(data)
    return this.partner.registerPartner(data, res);
  }

  @Post('/loginPartner')
  async loginPartner(@Body() data, @Res() res) {
    return this.partner.loginPartner(data, res);
  }

  @Post('/updatePartnerProfile')
  async updatePartnerProfile(@Body() data, @Res() res, @Req() req) {
    return this.partner.updatePartnerProfile(data, req, res);
  }
}
