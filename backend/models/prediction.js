const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor"
    },
    patient: {
      name: String,
      age: Number,
      gender: String,
      diabetesHistory: String,
      hypertension: String,
    },
    disease: {
      type: Boolean,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
    },
    image: String,
    heatmap: String,
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Prediction", schema);
