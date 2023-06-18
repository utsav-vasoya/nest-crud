import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PartnerDocument } from './partner.schema';
import { Model } from 'mongoose';

interface AuthRequest extends Request {
  partner: PartnerDocument;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @InjectModel('partners')
    private readonly partnerModel: Model<PartnerDocument>,
    private readonly configService: ConfigService,
  ) {}

  async use(req: AuthRequest, res: Response, next: NextFunction) {
    const token =
      req.body.token ||
      req.query.token ||
      req.headers['x-access-token'] ||
      req.headers.authorization;

    if (!token) {
      return res.status(203).send({
        message: 'Token is required.',
        isSuccess: false,
      });
    }

    const bearerToken = token.split(' ')[1];

    try {
      jwt.verify(
        bearerToken,
        process.env.PARTNER_TOKEN_KEY,
        async (err, authData) => {
          if (err) {
            return res.status(500).send({
              err,
              message: 'Invalid Token!',
              isSuccess: false,
            });
          }
          const partner = await this.partnerModel.findOne({
            _id: authData['partner_id'],
          });
          req.partner = partner;
          next();
        },
      );
    } catch (error) {
      return res.status(500).send({
        error: error.message,
        message: 'Something went wrong, please try again!',
        isSuccess: false,
      });
    }
  }
}
