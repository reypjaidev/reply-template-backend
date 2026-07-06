import mongoose, { type Document, Schema } from "mongoose";

export interface RefreshTokenDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
}

const refreshTokenSchema = new Schema<RefreshTokenDocument>({
  userId: {
    type: mongoose.Types.ObjectId,
    required: [true, "User ID is required"],
  },
  token: {
    type: String,
    required: [true, "Token is required"],
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: [true, "Expiration date is required"],
  },
});

refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshTokenModel = mongoose.model<RefreshTokenDocument>(
  "RefreshToken",
  refreshTokenSchema,
);
