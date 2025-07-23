const jwt = require("jsonwebtoken");
const Student = require("../models/student");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("Auth Header:", authHeader); 

  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.student = await Student.findById(decoded.id).select("-password");

      console.log("Authenticated Student:", req.student);

      
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};

module.exports = protect;
