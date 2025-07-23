const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {type: Number,
    required:true,
  },
  class: {
    type:Number,
    required:true,
  },
  admissionNumber: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    default: "", // will store filename or URL
  },
});

module.exports = mongoose.model("Student", studentSchema);
