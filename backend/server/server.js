const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config(); // Load .env

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // For images

//  DB CONNECTION + ROUTES TOGETHER
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(" MongoDB connected");

    //  Import routes only after DB connects
    const studentRoutes = require("./routes/studentRoutes");
    const adminRoutes = require("./routes/adminRoutes");

    //  Define routes after DB is ready
    app.use("/api/student", studentRoutes);
    app.use("/api/admin", adminRoutes);

    app.get("/", (req, res) => {
      res.send("API is running...");
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`✅ Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
  });
