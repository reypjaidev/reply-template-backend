import mongoose, { type Document, Schema } from "mongoose";

export interface PinDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userID: mongoose.Types.ObjectId;
  pin: string;
  failedAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const pinSchema = new Schema<PinDocument>(
  {
    userID: {
      type: Schema.Types.ObjectId,
      unique: true,
      required: [true, "User ID is required"],
    },
    pin: {
      type: String,
      required: [true, "PIN is required"],
    },
    failedAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // auto-manages createdAt and updatedAt
  },
);

pinSchema.index({ userID: 1 });

export const PinModel = mongoose.model<PinDocument>("Pin", pinSchema);
