import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  zipCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please enter your name'] },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  phno: {
    type: String
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  addresses: [addressSchema]
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.referralCode) {
    const cleanName = this.name ? this.name.split(' ')[0].replace(/[^A-Za-z0-9]/g, '').toUpperCase() : 'USER';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.referralCode = `AURA-${cleanName}-${randomNum}`;
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
