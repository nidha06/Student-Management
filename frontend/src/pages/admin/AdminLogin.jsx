import { useDispatch, useSelector } from 'react-redux';
import { loginAdmin } from '../../features/admin/adminSlice';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.admin);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setFormError('All fields are required');
      return;
    }

    const result = await dispatch(loginAdmin(formData));
    console.log('Login result:', result);
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/admin');
    }
  };



  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f3f4f6", // bg-gray-100
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "#ffffff",
          borderRadius: "0.75rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          padding: "2rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.875rem",
            fontWeight: "bold",
            marginBottom: "2rem",
            textAlign: "center",
            color: "#1f2937", // text-gray-800
          }}
        >
          Admin Login
        </h2>

        {formError && (
  <p
    style={{
      color: "#f87171", // red-500
      textAlign: "center",
      fontSize: "0.875rem",
      marginBottom: "1rem",
    }}
  >
    {formError}
  </p>
)}
  
        {error && (
          <p
            style={{
              color: "#f87171", // red-500
              textAlign: "center",
              fontSize: "0.875rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </p>
        )}
  
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
          }}
        >
          <div style={{ width: "18rem" }}>
            <label
              style={{
                display: "block",
                color: "#374151", // text-gray-700
                marginBottom: "0.25rem",
                fontSize: "0.875rem",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
             
              
              style={{
                width: "100%",
                border: "1px solid #d1d5db", // border-gray-300
                borderRadius: "0.375rem",
                padding: "0.5rem 1rem",
                outline: "none",
                transition: "box-shadow 0.2s",
              }}
            />
          </div>
  
          <div style={{ width: "18rem" }}>
            <label
              style={{
                display: "block",
                color: "#374151",
                marginBottom: "0.25rem",
                fontSize: "0.875rem",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
             
              
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                padding: "0.5rem 1rem",
                outline: "none",
                transition: "box-shadow 0.2s",
              }}
            />
          </div>
  
          <button
            type="submit"
            style={{
              width: "10rem",
              backgroundColor: "#16a34a", // green-600
              color: "#ffffff",
              fontWeight: "600",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#15803d")} // green-700
            onMouseOut={(e) => (e.target.style.backgroundColor = "#16a34a")}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );  

};

export default AdminLogin;
