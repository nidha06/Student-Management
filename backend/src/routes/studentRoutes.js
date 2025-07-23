const express = require("express");
const router = express.Router();
const { registerStudent, loginStudent, getStudentProfile, updateStudentProfile,} = require("../controllers/studentController");
const upload = require("../middlewares/multer");
const protect = require("../middlewares/authMiddleware");

router.post("/register", upload.single("profilePic"), registerStudent);
router.post("/login", loginStudent);
router.get("/profile", protect, getStudentProfile);
router.put("/profile", protect, upload.single("profilePic"), updateStudentProfile);

module.exports = router;
