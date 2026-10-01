const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: true },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
    avatar: { type: String, default: '' },

    savedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],

    // moderation
    isBlocked: { type: Boolean, default: false },
    isReported: { type: Boolean, default: false },
    reportReasons: [{ type: String }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
