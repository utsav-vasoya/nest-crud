import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PartnerController } from './partner/partner.controller';
import { PartnerService } from './partner/partner.service';
import { PartnerModule } from './partner/partner.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PartnerModule,
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/nest-crud'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
