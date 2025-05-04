import mongoose from "mongoose";

const Post = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    photo: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Post", Post);
