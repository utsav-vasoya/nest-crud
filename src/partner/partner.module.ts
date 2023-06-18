import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PartnerService } from './partner.service';
import { PartnerController } from './partner.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PartnerSchema } from 'src/partner/partner.schema';
import { AuthMiddleware } from './auth.middleware';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.PARTNER_TOKEN_KEY,
      signOptions: {
        expiresIn: process.env.TOKEN_EXPIRE_TIME,
      },
    }),
    MulterModule.registerAsync({
      useFactory: () => ({
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, callback) => {
            callback(
              null,
              file.originalname + '-' + extname(file.originalname),
            );
          },
        }),
        limits: {
          fileSize: 1 * 1024 * 1024,
        },
        fileFilter: (req, file, callback) => {
          const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
          const fileExtension = extname(file.originalname).toLowerCase();

          if (!allowedExtensions.includes(fileExtension)) {
            callback(new Error('Invalid file type.'), false);
          } else {
            callback(null, true);
          }
        },
      }),
    }),
    MongooseModule.forFeature([{ name: 'partners', schema: PartnerSchema }]),
  ],
  providers: [PartnerService],
  controllers: [PartnerController],
})
export class PartnerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'partner/getPartner', method: RequestMethod.GET },
        { path: 'partner/updatePartnerProfile', method: RequestMethod.POST },
      );
  }
}
