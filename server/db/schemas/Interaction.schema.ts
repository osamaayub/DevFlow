import {Schema} from "mongoose"



export const InteractionActionEnums = [
  "view",
  "upvote",
  "downvote",
  "bookmark",
  "post",
  "edit",
  "delete",
  "search",
] as const;

export interface IInteraction {
  user: Schema.Types.ObjectId
  action: typeof InteractionActionEnums[number],
  /** The question or answer acted on; not set for searches */
  actionId?: Schema.Types.ObjectId
  actionType?: "question" | "answer"
  /** Search text, only for "search" interactions */
  query?: string
}

// Every action targets a question or answer, except a search, which has only its text
function isSearch(this: { action?: string }) {
  return this.action === "search"
}

export const InteractionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      enum: InteractionActionEnums,
      required: true,
    },
    actionId: {
      type: Schema.Types.ObjectId,
      required: function (this: { action?: string }) { return !isSearch.call(this) },
    }, // questionId or answerId
    actionType: {
      type: String,
      enum: ["question", "answer"],
      required: function (this: { action?: string }) { return !isSearch.call(this) },
    },
    query: {
      type: String,
      trim: true,
      maxlength: 100,
      required: function (this: { action?: string }) { return isSearch.call(this) },
    },
  },
  { timestamps: true }
);

// A user's recent activity, and activity on a question or answer
InteractionSchema.index({ user: 1, createdAt: -1 });
InteractionSchema.index({ actionId: 1, action: 1 });
