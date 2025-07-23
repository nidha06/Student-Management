const Admin = require("../models/admin");
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

// Admin Login
const loginAdmin = async (req, res) => {
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

    // Find admin with case-insensitive email search
    const admin = await Admin.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    }).select('+password');

    if (!admin) {
      return res.status(401).json({ 
        message: "Invalid email or password",
        field: "credentials"
      });
    }

    // TODO: Use proper bcrypt comparison instead of hardcoded password
    // const isMatch = await bcrypt.compare(password, admin.password);
    // For now, using hardcoded password check
    if (password !== 'admin123') {
      return res.status(401).json({ 
        message: "Invalid email or password",
        field: "credentials"
      });
    }

    const token = jwt.sign(
      { 
        id: admin._id, 
        email: admin.email,
        role: "admin" 
      }, 
      process.env.JWT_SECRET || 'your_jwt_secret_change_this',
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: "admin"
      }
    });

  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ 
      message: "Login failed. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
            { admissionNumber: { $regex: req.query.search, $options: "i" } },
            { class: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const students = await Student.find(keyword).select("-password");
    
    res.json({
      success: true,
      count: students.length,
      students
    });

  } catch (error) {
    console.error("Get All Students Error:", error);
    res.status(500).json({ 
      message: "Failed to fetch students",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single student
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("-password");
    
    if (!student) {
      return res.status(404).json({ 
        message: "Student not found",
        field: "id"
      });
    }
    
    res.json({
      success: true,
      student
    });

  } catch (error) {
    console.error("Get Student Error:", error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid student ID format" });
    }
    
    res.status(500).json({ 
      message: "Failed to fetch student",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    
    if (!student) {
      return res.status(404).json({ 
        message: "Student not found",
        field: "id"
      });
    }
    
    res.json({ 
      success: true,
      message: "Student deleted successfully",
      deletedStudent: {
        id: student._id,
        name: student.name,
        email: student.email
      }
    });

  } catch (error) {
    console.error("Delete Student Error:", error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid student ID format" });
    }
    
    res.status(500).json({ 
      message: "Failed to delete student",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update student by admin
const updateStudentByAdmin = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ 
        message: "Student not found",
        field: "id"
      });
    }

    const { name, age, email, admissionNumber, password } = req.body;
    const className = req.body.class;

    // Validate individual fields if provided
    if (name !== undefined) {
      if (!name.trim() || name.trim().length < 2) {
        return res.status(400).json({ 
          message: "Name must be at least 2 characters long",
          field: "name"
        });
      }
      student.name = name.trim();
    }

    if (age !== undefined) {
      const ageNum = parseInt(age);
      if (!ageNum || ageNum < 5 || ageNum > 100) {
        return res.status(400).json({ 
          message: "Age must be between 5 and 100",
          field: "age"
        });
      }
      student.age = ageNum;
    }

    if (className !== undefined) {
      if (!className.trim()) {
        return res.status(400).json({ 
          message: "Class cannot be empty",
          field: "class"
        });
      }
      student.class = className.trim();
    }

    if (email !== undefined) {
      if (!isValidEmail(email.trim())) {
        return res.status(400).json({ 
          message: "Please provide a valid email address",
          field: "email"
        });
      }
      
      const normalizedEmail = email.toLowerCase().trim();
      
      // Check if email is being changed and if new email already exists
      if (normalizedEmail !== student.email.toLowerCase()) {
        const existingStudentEmail = await Student.findOne({ 
          email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') },
          _id: { $ne: student._id }
        });
        
        const existingAdminEmail = await Admin.findOne({ 
          email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
        });
        
        if (existingStudentEmail) {
          return res.status(409).json({ 
            message: "This email is already registered to another student",
            field: "email"
          });
        }
        
        if (existingAdminEmail) {
          return res.status(409).json({ 
            message: "This email is already registered to an admin",
            field: "email"
          });
        }
      }
      
      student.email = normalizedEmail;
    }

    if (admissionNumber !== undefined) {
      const trimmedAdmissionNumber = admissionNumber.trim();
      if (!trimmedAdmissionNumber) {
        return res.status(400).json({ 
          message: "Admission number cannot be empty",
          field: "admissionNumber"
        });
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

    // Handle password update
    if (password) {
      if (!isValidPassword(password)) {
        return res.status(400).json({ 
          message: "Password must be at least 8 characters with uppercase, lowercase, and number",
          field: "password"
        });
      }
      student.password = await bcrypt.hash(password, 12);
    }

    const updated = await student.save();

    res.json({
      success: true,
      message: "Student updated successfully",
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
    console.error("Update Student Error:", error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid student ID format" });
    }
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ 
        message: `This ${field} is already registered`,
        field: field
      });
    }

    res.status(500).json({ 
      message: "Student update failed. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create student by admin
const createStudentByAdmin = async (req, res) => {
  try {
    console.log('Admin creating student:', req.body);
    const { name, age, class: className, email, admissionNumber, password } = req.body;

    // Input validation - all fields are required
    if (!name || !age || !className || !admissionNumber || !email || !password) {
      return res.status(400).json({ 
        message: "All fields are required",
        required: ["name", "age", "class", "admissionNumber", "email", "password"]
      });
    }

    // Name validation
    if (name.trim().length < 2) {
      return res.status(400).json({ 
        message: "Name must be at least 2 characters long",
        field: "name"
      });
    }

    // Age validation
    const ageNum = parseInt(age);
    if (!ageNum || ageNum < 5 || ageNum > 100) {
      return res.status(400).json({ 
        message: "Age must be between 5 and 100",
        field: "age"
      });
    }

    // Email validation
    if (!isValidEmail(email.toLowerCase().trim())) {
      return res.status(400).json({ 
        message: "Please provide a valid email address",
        field: "email"
      });
    }

    // Password validation
    if (!isValidPassword(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters with uppercase, lowercase, and number",
        field: "password"
      });
    }

    // Admission number validation
    if (!admissionNumber.trim()) {
      return res.status(400).json({ 
        message: "Admission number is required",
        field: "admissionNumber"
      });
    }

    // Class validation
    if (!className.trim()) {
      return res.status(400).json({ 
        message: "Class is required",
        field: "class"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedAdmissionNumber = admissionNumber.trim();

    // Check for existing email in both Student and Admin collections (case-insensitive)
    const existingStudentEmail = await Student.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    });
    
    const existingAdminEmail = await Admin.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    });
    
    if (existingStudentEmail) {
      return res.status(409).json({ 
        message: "A student with this email already exists",
        field: "email"
      });
    }
    
    if (existingAdminEmail) {
      return res.status(409).json({ 
        message: "An admin with this email already exists",
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
    const hashedPassword = await bcrypt.hash(password, 12);

    const newStudent = new Student({
      name: name.trim(),
      age: ageNum,
      class: className.trim(),
      email: normalizedEmail,
      admissionNumber: trimmedAdmissionNumber,
      password: hashedPassword,
      profilePic: req.file ? req.file.filename : "",
    });

    const savedStudent = await newStudent.save();

    res.status(201).json({ 
      success: true,
      message: "Student created successfully", 
      student: {
        id: savedStudent._id,
        name: savedStudent.name,
        email: savedStudent.email,
        age: savedStudent.age,
        class: savedStudent.class,
        admissionNumber: savedStudent.admissionNumber,
        profilePic: savedStudent.profilePic,
      }
    });

  } catch (error) {
    console.error("Create Student Error:", error);
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ 
        message: `This ${field} is already registered`,
        field: field
      });
    }

    res.status(500).json({ 
      message: "Failed to create student. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  loginAdmin,
  getAllStudents,
  getStudentById,
  deleteStudent,
  updateStudentByAdmin,
  createStudentByAdmin,
};