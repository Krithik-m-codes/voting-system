import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  electionParty: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  votes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      votedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  voteCount : {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("Candidate", candidateSchema);
