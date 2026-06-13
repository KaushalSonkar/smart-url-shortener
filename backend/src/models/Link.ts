import mongoose, { Schema } from 'mongoose';

const LinkSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customAlias: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null/undefined values while ensuring uniqueness for strings
      trim: true,
      index: true,
    },
    qrCode: {
      type: String,
      required: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export interface ILink extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  originalUrl: string;
  shortCode: string;
  customAlias?: string;
  qrCode: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

export const Link = mongoose.model<ILink>('Link', LinkSchema);
