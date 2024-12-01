const mongoose = require("mongoose");

const socialSchema = mongoose.Schema(
  {
    whatsapp: {
      type: String,
      required: [true, "Please add a whatapp lin"],
      trim: true,
    },
    instagram: {
      type: String,
      required: [true, "Please add a instagram link"],
      trim: true,
    },
    tiktok: {
      type: String,
      required: [true, "Please add a tiktok link"],
      trim: true,
    },
    facebook: {
        type: String,
        required: [true, "Please add a facebook link"],
        trim: true,
      },
      youtube: {
        type: String,
        required: [true, "Please add a youtub link"],
        trim: true,
      },
      twitter: {
        type: String,
        required: [true, "Please add a twitter link"],
        trim: true,
      }
  },
  {
    timestamps: true,
  }
);

const Social = mongoose.model("Social", socialSchema);
module.exports = Social;
