const mongoose = require('mongoose');

const referralSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
    referralledCount: {
      type: Number,
      required: true,
      default: 0,
    },
    amount: {
      type: Number,
      required: true,
      default: 500,
    },
    total: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Update `total` before saving a new document
referralSchema.pre('save', function (next) {
  this.total = this.referralledCount * this.amount;
  next();
});

const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;
