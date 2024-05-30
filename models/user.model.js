import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  mobile: {
    type: String,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  aadharCardNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "voter",
    enum: ["voter", "admin"],
  },
  isVoted: {
    type: Boolean,
    default: false,
  },
  //voted to elector id
//   votedTo: {
//     type: String,
//   },
});

//hash the password before saving the person model
userSchema.pre("save", async function (next) {
  const user = this;
  //hash the password only if it has been modified (or is new)
  if (!user.isModified("password")) return next();
  try {
    //hash password generate
    const salt = await bcrypt.genSalt(10);
    //hash password
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

// compare the candidate password with the stored password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // compare the salt and hash of the candidate password with the stored password hash in the database
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    throw error;
  }
};

export default mongoose.model("User", userSchema);
