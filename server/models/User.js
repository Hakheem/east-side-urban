const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    // Removed unique: true to avoid conflicts with Google users
  }, 
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function() {
      // Password is only required if user is not signing up via Google
      return !this.googleId;
    },
  },
  role: {
    type: String,
    default: "user",
  },
  // New fields for Google authentication
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values and ensures uniqueness only when present
  },
  profilePicture: {
    type: String,
    default: null,
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  isVerified: {
    type: Boolean,
    default: function() {
      // Google users are automatically verified
      return this.authProvider === 'google';
    },
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Ensure either email/password or googleId exists
userSchema.pre('save', function(next) {
  if (!this.password && !this.googleId) {
    return next(new Error('User must have either password or Google ID'));
  }
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;

