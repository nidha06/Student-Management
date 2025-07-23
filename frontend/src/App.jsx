import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminProtectedRoute from "./components/ProtectedRoutes";
import AdminEditStudent from "./pages/admin/AdminEditStudent";
import "./index.css"; // or './App.css' — whichever has the tailwind directives
import TailwindTest from "./pages/TailwindTest";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route path="/admin/edit/:id" element={<AdminEditStudent />} />
      <Route path="/test" element={<TailwindTest />} />

      {/* <Route path="/admin" element={<AdminDashboard />} />  */}
    </Routes>
  );
};

export default App;
