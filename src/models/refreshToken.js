const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  token: { 
    type: String, 
    required: true, 
    unique: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Users', 
    required: true
  },
  expiresAt: { 
    type: Date, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  revoked: { 
    type: Boolean, 
    default: false 
  },
  revokedAt: { 
    type: Date, 
    default: null 
  },
  replacedByToken: { 
    type: String, 
    default: null 
  }
});

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
