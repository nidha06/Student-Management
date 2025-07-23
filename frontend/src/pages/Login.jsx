import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/auth/authSlice";
import { Navigate, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user, token } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isSubscribed = true;

    if (isSubscribed && user && token) {
      navigate("/profile", { replace: true });
    }

    return () => {
      isSubscribed = false;
    };
  }, [user, token, navigate]);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) newErrors.email = "Email required";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Invalid email";

    if (!formData.password) newErrors.password = "Password required";
    else if (formData.password.length < 6)
      newErrors.password = "Min 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("🚀 Dispatching login action...");
      dispatch(loginUser(formData));
    }
  };

  const inputStyle = (hasError) => ({
    padding: "12px",
    width: "100%",
    fontSize: "16px",
    borderRadius: "6px",
    border: `2px solid ${hasError ? "#ef4444" : "#d1d5db"}`,
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#ffffff",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#000000",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <h2
          style={{ textAlign: "center", margin: "0 0 10px", color: "#ffffff" }}
        >
          Welcome Back
        </h2>

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={inputStyle(errors.email)}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) =>
              (e.target.style.borderColor = errors.email
                ? "#ef4444"
                : "#d1d5db")
            }
          />
          {errors.email && (
            <div
              style={{ color: "#ef4444", fontSize: "14px", marginTop: "5px" }}
            >
              {errors.email}
            </div>
          )}
        </div>

        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={inputStyle(errors.password)}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) =>
              (e.target.style.borderColor = errors.password
                ? "#ef4444"
                : "#d1d5db")
            }
          />
          {errors.password && (
            <div
              style={{ color: "#ef4444", fontSize: "14px", marginTop: "5px" }}
            >
              {errors.password}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px",
            background: loading ? "#9ca3af" : "#ffffff",
            color: "#000000",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => {
            if (!loading) e.target.style.background = "#f3f4f6";
          }}
          onMouseOut={(e) => {
            if (!loading) e.target.style.background = "#ffffff";
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {error && (
          <div
            style={{
              color: "#ef4444",
              textAlign: "center",
              fontSize: "14px",
              padding: "10px",
              background: "#fee2e2",
              borderRadius: "6px",
            }}
          >
            {error}
          </div>
        )}

        <p
          style={{
            textAlign: "center",
            margin: "10px 0 0",
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#3b82f6",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
