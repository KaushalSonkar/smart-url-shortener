import mongoose, { Schema } from 'mongoose';

const AnalyticsSchema = new Schema(
  {
    linkId: {
      type: Schema.Types.ObjectId,
      ref: 'Link',
      required: true,
      index: true,
    },
    ip: {
      type: String,
      default: 'Unknown',
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    device: {
      type: String,
      default: 'Desktop',
    },
    referrer: {
      type: String,
      default: 'Direct',
    },
    operatingSystem: {
      type: String,
      default: 'Unknown',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need createdAt for analytics logs
  }
);

export interface IAnalytics extends mongoose.Document {
  linkId: mongoose.Types.ObjectId;
  ip: string;
  browser: string;
  device: string;
  referrer: string;
  operatingSystem: string;
  createdAt: Date;
}

export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
