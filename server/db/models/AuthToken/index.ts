import { model, models } from "mongoose"

import {
  AccountLinkIntentSchema,
  IAccountLinkIntent,
  IPasswordResetToken,
  PasswordResetTokenSchema
} from "../../schemas/AuthToken.schema"

export const PasswordResetToken =
  models?.PasswordResetToken ||
  model<IPasswordResetToken>("PasswordResetToken", PasswordResetTokenSchema)

export const AccountLinkIntent =
  models?.AccountLinkIntent ||
  model<IAccountLinkIntent>("AccountLinkIntent", AccountLinkIntentSchema)
