const mongoose = require("mongoose");

const posterSchema = mongoose.Schema(
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

const Poster = mongoose.model("Poster", posterSchema);
module.exports = Poster;
