import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    friend_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "blocked"],
      default: "pending",
    },
    requester_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    accepted_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for efficient queries
friendSchema.index({ user_id: 1, friend_id: 1 }, { unique: true });
friendSchema.index({ user_id: 1, status: 1 });
friendSchema.index({ friend_id: 1, status: 1 });
friendSchema.index({ requester_id: 1, status: 1 });

// Static method to create friendship (bidirectional)
friendSchema.statics.createFriendship = async function (
  requesterId,
  recipientId,
) {
  // Check if friendship already exists
  const existing = await this.findOne({
    $or: [
      { user_id: requesterId, friend_id: recipientId },
      { user_id: recipientId, friend_id: requesterId },
    ],
  });

  if (existing) {
    throw new Error("Friendship already exists");
  }

  // Create both directions of the friendship individually
  const friendship1 = await this.create({
    user_id: requesterId,
    friend_id: recipientId,
    requester_id: requesterId,
    status: "pending",
  });

  const friendship2 = await this.create({
    user_id: recipientId,
    friend_id: requesterId,
    requester_id: requesterId,
    status: "pending",
  });

  return [friendship1, friendship2];
};

// Static method to accept friendship
friendSchema.statics.acceptFriendship = async function (userId, friendId) {
  const acceptedAt = new Date();

  await this.updateMany(
    {
      $or: [
        { user_id: userId, friend_id: friendId },
        { user_id: friendId, friend_id: userId },
      ],
    },
    {
      $set: {
        status: "accepted",
        accepted_at: acceptedAt,
      },
    },
  );

  return { status: "accepted", accepted_at: acceptedAt };
};

// Static method to remove friendship
friendSchema.statics.removeFriendship = async function (userId, friendId) {
  await this.deleteMany({
    $or: [
      { user_id: userId, friend_id: friendId },
      { user_id: friendId, friend_id: userId },
    ],
  });
};

// Static method to block user
friendSchema.statics.blockUser = async function (userId, friendId) {
  await this.updateOne(
    { user_id: userId, friend_id: friendId },
    {
      $set: {
        status: "blocked",
      },
    },
    { upsert: true },
  );
};

export default mongoose.models.Friend || mongoose.model("Friend", friendSchema);
