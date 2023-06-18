import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
export type PartnerDocument = Partner & Document;

@Schema({ timestamps: true })
export class Partner {
  @Prop()
  fullName: string;

  @Prop()
  phoneNo: number;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  isActive: boolean;
}
export const PartnerSchema = SchemaFactory.createForClass(Partner);
