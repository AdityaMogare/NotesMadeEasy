import mongoose from "mongoose";

const noteShareSchema = new mongoose.Schema(
  {
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    permission: {
      type: String,
      enum: ["read", "edit"],
      default: "read",
    },
  },
  { timestamps: true }
);

noteShareSchema.index({ note: 1, sharedWith: 1 }, { unique: true });
noteShareSchema.index({ sharedWith: 1, createdAt: -1 });

const NoteShare = mongoose.model("NoteShare", noteShareSchema);

export default NoteShare;
