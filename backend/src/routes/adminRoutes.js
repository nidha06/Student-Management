const express = require("express");
const router = express.Router();
const {
  loginAdmin,
  getAllStudents,
  getStudentById,
  deleteStudent,
  updateStudentByAdmin,
  createStudentByAdmin,
} = require("../controllers/adminController");
const adminAuth = require("../middlewares/adminAuth");


const upload = require("../middlewares/multer");

router.post("/login", loginAdmin);
router.get("/students", adminAuth, getAllStudents);
router.get("/students/:id", adminAuth, getStudentById);
router.put("/students/:id", adminAuth, upload.single("profilePic"),updateStudentByAdmin);
// router.post("/students", adminAuth, createStudentByAdmin);
router.post("/students", adminAuth, upload.single('profilePic'), createStudentByAdmin);

router.delete("/students/:id", adminAuth, deleteStudent);

module.exports = router;
