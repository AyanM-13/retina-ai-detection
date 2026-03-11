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
    // CHANGED: From Boolean to String to store severity levels
    disease: {
      type: String, 
      required: true,
    },
    // CHANGED: From Number to String to handle the percentage text
    confidence: {
      type: String, 
      required: true,
    },
    // ADDED: Useful for sorting or logic in the future
    classId: {
      type: Number,
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