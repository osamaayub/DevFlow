import { Schema } from "mongoose"

export interface IUser {
  _id: string // ✅ Added _id to fix TS2339 in auth.ts
  name: string
  username: string
  email: string
  bio?: string
  image: string
  location?: string
  portfolio?: string
  reputation?: number
  password?: string // ✅ Made optional (OAuth users might not have a password)
  joinedAt?: Date
}

export const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    bio: {
      type: String
    },
    image: {
      type: String
    },
    location: {
      type: String
    },
    portfolio: {
      type: String
    },
    reputation: {
      type: Number,
      default: 0
    },
    password: {
      type: String,
      minLength: 4,
      maxLength: 8
    },
    joinedAt: {
      type: Date
    }
  },
  { timestamps: true }
)
