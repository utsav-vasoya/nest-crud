import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PartnerDocument } from './partner.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PartnerService {
  constructor(
    @InjectModel('partners')
    private readonly partnerModel: Model<PartnerDocument>,
    private readonly jwtService: JwtService,
  ) {}

  getPartnerProfile() {
    return this.partnerModel.find();
  }

  async registerPartner(data, res) {
    const partner = new this.partnerModel(data);
    const findPartnerEmail = await this.partnerModel.find({
      email: data.email,
    });
    if (findPartnerEmail.length > 0) {
      return res.status(203).send({
        message: 'Email is already registered.',
        isSuccess: false,
      });
    }
    partner.password = await bcrypt.hash(partner.password, 10);
    await partner.save();
    return res.status(200).send({
      message: 'Register successfully.',
      isSuccess: true,
    });
  }

  async loginPartner(data, res) {
    try {
      const { email, password } = data;
      const findPartner = await this.partnerModel.findOne({ email });
      if (!findPartner) {
        return res.status(203).send({
          message: 'Email not found.',
          isSuccess: false,
        });
      }
      const isMatch = await bcrypt.compare(password, findPartner.password);
      if (isMatch) {
        const generateAuthToken = this.jwtService.sign(
          { partner_id: findPartner._id, email },
          {
            expiresIn: process.env.TOKEN_EXPIRE_TIME,
          },
        );
        return res.status(200).send({
          generateAuthToken,
          message: 'Login successfully.',
          isSuccess: true,
        });
      } else {
        return res.status(203).send({
          message: 'Invalid password!',
          isSuccess: false,
        });
      }
    } catch (error) {
      return res.status(HttpStatus.NON_AUTHORITATIVE_INFORMATION).send({
        error: error.message,
        isSuccess: false,
      });
    }
  }

  async updatePartnerProfile(data, req, res) {
    let { fullName, email, phoneNo } = data;
    const getPartner = await this.partnerModel.findById(req.partner.id);
    if (!getPartner) {
      return res.status(203).send({
        message: 'Partner not found.',
        isSuccess: false,
      });
    }
    const getEmail = await this.partnerModel.findOne({
      _id: { $ne: req.partner.id },
      email,
    });
    if (getEmail) {
      return res.status(203).send({
        message: 'This email address has been taken by another partner.',
        isSuccess: false,
      });
    }
    await this.partnerModel
      .findByIdAndUpdate(
        req.partner.id,
        {
          fullName,
          email,
          phoneNo,
        },
        { new: true },
      )
      .then((profile) => {
        if (!profile) {
          return res.status(203).send({
            message: 'Profile not found!',
            isSuccess: false,
          });
        }
        return res.status(200).send({
          profile,
          message: 'Profile updated successfully.',
          isSuccess: true,
        });
      })
      .catch((error) => {
        return res.status(500).send({
          error: error.message,
          message: 'Something went wrong, please try again!',
          isSuccess: false,
        });
      });
  }
}
