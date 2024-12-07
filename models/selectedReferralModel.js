const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    userId:{
     type:String,
    },
    withdrawalId:{
     type:String,
    },
    status: {
      type: String,
      enum:["none","normal"],
      default: "none",
      trim: true,
    },
  }, 
  {
    timestamps: true,
  }
);

const SelectedReferralUser = mongoose.model("SelectedReferralUser", userSchema);
module.exports = SelectedReferralUser;