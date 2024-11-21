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
      required: true,
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

// // Update `total` before updating an existing document
// referralSchema.pre('findOneAndUpdate', function (next) {
//   const update = this.getUpdate();

//   // Ensure referralledCount and amount are part of the update if they exist
//   if (update.referralledCount !== undefined || update.amount !== undefined) {
//     const referralledCount = update.referralledCount || this.referralledCount;
//     const amount = update.amount || this.amount;

//     // Recalculate total and include it in the update
//     update.total = referralledCount * amount;
//   }

//   next();
// });

// // Alternatively, for updateOne middleware:
// referralSchema.pre('updateOne', function (next) {
//   const update = this.getUpdate();

//   if (update.referralledCount !== undefined || update.amount !== undefined) {
//     const referralledCount = update.referralledCount || this.referralledCount;
//     const amount = update.amount || this.amount;

//     update.total = referralledCount * amount;
//   }

//   next();
// });

const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;
