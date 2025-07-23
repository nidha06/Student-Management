const Student = require("../models/student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Email validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation helper
const isValidPassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const registerStudent = async (req, res) => {
  try {
    console.log('req body',req.body);
    const { name, age, class: className, admissionNumber, email, password } = req.body;

    // Input validation
    if (!name || !age || !className || !admissionNumber || !email || !password) {
      return res.status(400).json({ 
        message: "All fields are required",
        required: ["name", "age", "class", "admissionNumber", "email", "password"]
      });
    }

    // Name validation
    if (name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters long" });
    }

    // Age validation
    const ageNum = parseInt(age);
    if (!ageNum || ageNum < 5 || ageNum > 100) {
      return res.status(400).json({ message: "Age must be between 5 and 100" });
    }

    // Email validation
    if (!isValidEmail(email.toLowerCase().trim())) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    // Password validation
    if (!isValidPassword(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters with uppercase, lowercase, and number" 
      });
    }

    // Admission number validation
    if (!admissionNumber.trim()) {
      return res.status(400).json({ message: "Admission number is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedAdmissionNumber = admissionNumber.trim();

    // Check for existing email (case-insensitive)
    const existingEmail = await Student.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    });
    
    if (existingEmail) {
      return res.status(409).json({ 
        message: "An account with this email already exists",
        field: "email"
      });
    }

    // Check for existing admission number
    const existingAdmission = await Student.findOne({ 
      admissionNumber: trimmedAdmissionNumber 
    });
    
    if (existingAdmission) {
      return res.status(409).json({ 
        message: "This admission number is already registered",
        field: "admissionNumber"
      });
    }

    // Hash password with higher salt rounds for better security
    const hashed = await bcrypt.hash(password, 12);

    const newStudent = new Student({
      name: name.trim(),
      age: ageNum,
      class: className.trim(),
      admissionNumber: trimmedAdmissionNumber,
      email: normalizedEmail,
      password: hashed,
      profilePic: req.file ? req.file.filename : "",
    });

    const savedStudent = await newStudent.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: savedStudent._id, 
        email: savedStudent.email,
        type: 'student'
      },
      process.env.JWT_SECRET || 'your_jwt_secret_change_this',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      token,
      user: {
        id: savedStudent._id,
        name: savedStudent.name,
        email: savedStudent.email,
        age: savedStudent.age,
        class: savedStudent.class,
        admissionNumber: savedStudent.admissionNumber,
        profilePic: savedStudent.profilePic,
      },
    });

  } catch (error) {
    console.error("Registration Error:", error);
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ 
        message: `This ${field} is already registered`,
        field: field
      });
    }

    res.status(500).json({ 
      message: "Registration failed. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required",
        required: ["email", "password"]
      });
    }

    // Email format validation
    if (!isValidEmail(email.trim())) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find student with case-insensitive email search
    const student = await Student.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    }).select('+password'); // Explicitly include password field

    if (!student) {
      return res.status(401).json({ 
        message: "Invalid email or password",
        field: "credentials"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: "Invalid email or password",
        field: "credentials"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: student._id, 
        email: student.email,
        type: 'student'
      },
      process.env.JWT_SECRET || 'your_jwt_secret_change_this',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        age: student.age,
        class: student.class,
        admissionNumber: student.admissionNumber,
        profilePic: student.profilePic,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ 
      message: "Login failed. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getStudentProfile = async (req, res) => {
  try {
    if (!req.student) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const student = await Student.findById(req.student._id).select('-password');
    
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }
    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        age: student.age,
        class: student.class,
        admissionNumber: student.admissionNumber,
        profilePic: student.profilePic,
      }
    });

  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ 
      message: "Failed to fetch profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    if (!req.student) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const student = await Student.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const { name, age, class: className, email, admissionNumber, password } = req.body;

    // Validate individual fields if provided
    if (name !== undefined) {
      if (!name.trim() || name.trim().length < 2) {
        return res.status(400).json({ message: "Name must be at least 2 characters long" });
      }
      student.name = name.trim();
    }

    if (age !== undefined) {
      const ageNum = parseInt(age);
      if (!ageNum || ageNum < 5 || ageNum > 100) {
        return res.status(400).json({ message: "Age must be between 5 and 100" });
      }
      student.age = ageNum;
    }

    if (className !== undefined) {
      if (!className.trim()) {
        return res.status(400).json({ message: "Class cannot be empty" });
      }
      student.class = className.trim();
    }

    if (email !== undefined) {
      if (!isValidEmail(email.trim())) {
        return res.status(400).json({ message: "Please provide a valid email address" });
      }
      
      const normalizedEmail = email.toLowerCase().trim();
      
      // Check if email is being changed and if new email already exists
      if (normalizedEmail !== student.email.toLowerCase()) {
        const existingEmail = await Student.findOne({ 
          email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') },
          _id: { $ne: student._id }
        });
        
        if (existingEmail) {
          return res.status(409).json({ 
            message: "This email is already registered to another account",
            field: "email"
          });
        }
      }
      
      student.email = normalizedEmail;
    }

    if (admissionNumber !== undefined) {
      const trimmedAdmissionNumber = admissionNumber.trim();
      if (!trimmedAdmissionNumber) {
        return res.status(400).json({ message: "Admission number cannot be empty" });
      }
      
      // Check if admission number is being changed and if new number already exists
      if (trimmedAdmissionNumber !== student.admissionNumber) {
        const existingAdmission = await Student.findOne({ 
          admissionNumber: trimmedAdmissionNumber,
          _id: { $ne: student._id }
        });
        
        if (existingAdmission) {
          return res.status(409).json({ 
            message: "This admission number is already registered",
            field: "admissionNumber"
          });
        }
      }
      
      student.admissionNumber = trimmedAdmissionNumber;
    }

    // Handle profile picture update
    if (req.file) {
      student.profilePic = req.file.filename;
    }

    console.log('[debug]:profile image coming:' , student , req.file.filename)

    // Handle password update
    if (password) {
      if (!isValidPassword(password)) {
        return res.status(400).json({ 
          message: "Password must be at least 8 characters with uppercase, lowercase, and number" 
        });
      }
      student.password = await bcrypt.hash(password, 12);
    }

    const updated = await student.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      student: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        age: updated.age,
        class: updated.class,
        admissionNumber: updated.admissionNumber,
        profilePic: updated.profilePic,
      },
    });

  } catch (error) {
    console.error("Update Error:", error);
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ 
        message: `This ${field} is already registered`,
        field: field
      });
    }

    res.status(500).json({ 
      message: "Profile update failed. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  registerStudent,
  loginStudent,
  getStudentProfile,
  updateStudentProfile,
};