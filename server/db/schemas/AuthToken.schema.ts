import { Schema, Types } from "mongoose"

export interface IPasswordResetToken {
  tokenHash: string
  userId: Types.ObjectId
  expiresAt: Date
}

export const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
)

PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
PasswordResetTokenSchema.index({ userId: 1 })

export interface IAccountLinkIntent {
  tokenHash: string
  userId: Types.ObjectId
  email: string
  provider: "google" | "github"
  expiresAt: Date
}

export const AccountLinkIntentSchema = new Schema<IAccountLinkIntent>(
  {
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    provider: { type: String, enum: ["google", "github"], required: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
)

AccountLinkIntentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
AccountLinkIntentSchema.index({ userId: 1, provider: 1 })
