const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); 
const userSchema = new mongoose.Schema( {

  username: { type: String, required: [true, "Username is required"], trim: true, unique: true},
  email: { type: String, required: [true, "Email is required"], unique: true, trim: true, lowercase: true},
  password: { type: String, required: [true, "Password is required"], minlength: [6, "Password must be at least 6 characters long"]},
  giteaUserId: { type: Number},
  giteaToken: String,
  jiraIdentity: { accountId: { type: String }, displayName: String, active: Boolean },
  userType: {  type: String, default: "free", enum: ["free", "premium", "admin"]},
  createdAt: { type: Date, default: Date.now}
});

// Add to User schema methods:
userSchema.methods.generateAuthToken = async function() {
  const token = jwt.sign(
    { id: this._id.toString() }, 
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  return token;
};

// Hash the password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);