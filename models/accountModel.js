const mongoose = require("mongoose");

const accountSchema = mongoose.Schema(
  {
    bank_name: {
      type: String,
      required: [true, "Please add a bank name"],
      trim: true,
    },
    account_holder_name: {
      type: String,
      required: true,
      required: [true, "Please add a account_holder name"],
      trim: true,
    },
    account_number: {
      type: String,
      required: [true, "Please add a account number"],
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

const Account = mongoose.model("Account", accountSchema);
module.exports = Account;
