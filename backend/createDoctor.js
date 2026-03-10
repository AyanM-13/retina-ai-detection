const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Doctor = require("./models/Doctor");

mongoose.connect("mongodb://127.0.0.1:27017/retinaAI");

async function create(){
  const hash = await bcrypt.hash("doctor123",10);

  await Doctor.create({
    email:"doctor@retina.ai",
    password:hash
  });

  console.log("Doctor created");
  process.exit();
}

create();