const mongoose = require("mongoose");

const depositBoxSchema = mongoose.Schema(
  {
    image: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const DepositBox = mongoose.model("DepositBox", depositBoxSchema);
module.exports = DepositBox;
