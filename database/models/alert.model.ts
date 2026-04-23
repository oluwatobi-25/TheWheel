import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAlert extends Document {
  userId: string;
  symbol: string;
  company: string;
  alertName: string;
  alertType: 'upper' | 'lower';
  threshold: number;
  lastPrice?: number;
  isTriggered: boolean;
  triggeredAt?: Date;
  frequency: 'once-per-minute' | 'once-per-hour' | 'once-per-day';
  createdAt: Date;
}

const AlertSchema: Schema = new Schema({
  userId: { type: String, required: true },
  symbol: { type: String, required: true },
  company: { type: String, required: true },
  alertName: { type: String, required: true },
  alertType: { type: String, enum: ['upper', 'lower'], required: true },
  threshold: { type: Number, required: true },
  frequency: { type: String, enum: ['once-per-minute', 'once-per-hour', 'once-per-day'], default: 'once-per-day' },
  lastPrice: { type: Number },
  isTriggered: { type: Boolean, default: false },
  triggeredAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const Alert: Model<IAlert> = mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema);
